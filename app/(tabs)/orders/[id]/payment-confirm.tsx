import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import type { Order } from '@/types';

function pickParam(record: Record<string, string | string[] | undefined>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = record[k];
    if (typeof v === 'string' && v.length) {
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    }
    if (Array.isArray(v) && typeof v[0] === 'string' && v[0].length) {
      try {
        return decodeURIComponent(v[0]);
      } catch {
        return v[0];
      }
    }
  }
  return undefined;
}

function isPaid(raw: string) {
  return String(raw || '').toLowerCase() === 'paid';
}

function isFailed(raw: string) {
  return String(raw || '').toLowerCase() === 'failed';
}

const POLL_MS = 1600;

export default function PaymentConfirmScreen() {
  const rawParams = useLocalSearchParams<Record<string, string | string[]>>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const orderIdRaw = rawParams.id;
  const orderId = Array.isArray(orderIdRaw) ? orderIdRaw[0] : orderIdRaw;

  const hintRef = useMemo(
    () =>
      pickParam(rawParams, [
        'paymentReference',
        'payment_reference',
        'paymentRef',
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawParams)]
  );

  const [busy, setBusy] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<'unknown' | 'paid' | 'failed' | 'pending'>('unknown');
  const [message, setMessage] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!orderId) {
        setOutcome('failed');
        setMessage('Missing order.');
        setBusy(false);
        return;
      }

      setBusy(true);
      setOutcome('unknown');
      setMessage('Confirming payment with Bookmate…');

      let orderSnapshot: Order | null = null;
      try {
        orderSnapshot = await apiService.getOrderById(orderId);
      } catch {
        if (!alive) return;
        setOutcome('failed');
        setMessage('Could not load your order.');
        setBusy(false);
        return;
      }

      const ref = hintRef || orderSnapshot.paymentReference || '';

      if (!ref) {
        if (!alive) return;
        setOutcome('pending');
        setMessage(
          'No payment reference yet. If you just paid, tap Retry — or check Orders shortly.'
        );
        setBusy(false);
        return;
      }

      try {
        for (let i = 0; i < 6 && alive; i++) {
          setAttempt(i + 1);
          let gatewayStatus = '';
          try {
            const st = await apiService.getPaymentStatus(ref);
            gatewayStatus = String(st.status ?? '');
          } catch {
            gatewayStatus = '';
          }

          orderSnapshot = await apiService.getOrderById(orderId);
          const orderPaid = orderSnapshot.paymentStatus === 'paid';

          if (!alive) return;

          if (isPaid(gatewayStatus) || orderPaid) {
            setOutcome('paid');
            setMessage('Payment confirmed. Thanks!');
            setBusy(false);
            setTimeout(() => router.replace('/(tabs)/orders'), 1200);
            return;
          }

          if (isFailed(gatewayStatus) || orderSnapshot.paymentStatus === 'failed') {
            setOutcome('failed');
            setMessage('Payment failed or was cancelled.');
            setBusy(false);
            return;
          }

          await new Promise((r) => setTimeout(r, POLL_MS));
        }

        if (!alive) return;
        setOutcome('pending');
        setMessage(
          'Still pending. Your server webhook may finalize this — check Orders shortly.'
        );
      } finally {
        if (alive) setBusy(false);
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [orderId, hintRef, router, tick]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Payment
        </ThemedText>

        {busy ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.note, { color: colors.icon, marginTop: 16 }]}>
              Checking gateway… ({attempt}/6)
            </Text>
          </View>
        ) : outcome === 'paid' ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.note, { color: colors.success }]}>{message}</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.note, { color: colors.text }]}>{message}</Text>
            {(outcome === 'failed' || outcome === 'pending') && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setTick((t) => t + 1);
                }}
              >
                <Text style={styles.btnTxt}>Retry check</Text>
              </TouchableOpacity>
            )}
            {outcome === 'failed' && (
              <TouchableOpacity
                style={[styles.btnOutline, { borderColor: colors.border }]}
                onPress={() => router.replace(`/(tabs)/orders/${orderId}/payment`)}
              >
                <Text style={[styles.btnOutlineTxt, { color: colors.text }]}>Back to checkout</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={() => router.replace('/(tabs)/orders')}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>Orders</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, marginBottom: 24 },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: 'stretch',
    gap: 12,
  },
  note: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  btn: { borderRadius: 12, padding: 16, marginTop: 8, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnOutline: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  btnOutlineTxt: { fontSize: 16, fontWeight: '600' },
});
