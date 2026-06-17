import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { apiService } from '../../services/api';
import { BookCard } from '../../components/BookCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import AnimatedView from '../../components/AnimatedView';
import TouchableRipple from '../../components/TouchableRipple';
import { SkeletonBookCard } from '../../components/Skeleton';
import type { Book } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage';

export default function BooksScreenSmooth() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const categories: string[] = ['all', 'Textbook', 'Manual', 'Guide', 'Past Paper'];

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    filterBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, books]);

  useEffect(() => {
    // Scroll to top when filters change
    if (currentPage === 1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  const loadBooks = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const data = await apiService.getBooksPaginated(currentPage, 12, {
        search: searchTerm || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      
      setBooks(currentPage === 1 ? data.books : [...books, ...data.books]);
      setTotalPages(data.totalPages);
      setTotalBooks(data.total);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Could not load books', getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && !isLoadingMore && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderBookItem = useCallback(({ item, index }: { item: Book; index: number }) => (
    <AnimatedView
      animationType="slideUp"
      duration={500}
      delay={index * 30}
      style={styles.bookItem}
    >
      <TouchableRipple onPress={() => {}}>
        <BookCard book={item} />
      </TouchableRipple>
    </AnimatedView>
  ), []);

  const renderSkeleton = useCallback(() => (
    <View style={styles.row}>
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonBookCard key={i} style={styles.skeletonItem} />
      ))}
    </View>
  ), []);

  return (
    <ThemedView style={styles.container}>
      {/* Smooth Header */}
      <Animated.View
        style={[
          styles.header,
          {
            shadowOpacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 0.1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <AnimatedView animationType="slideDown" duration={600}>
          <ThemedText type="title" style={styles.title}>
            Browse Books
          </ThemedText>
        </AnimatedView>

        <AnimatedView animationType="fadeIn" duration={600} delay={100}>
          <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <TextInput
              style={[styles.searchInput, isSearchFocused && styles.searchInputFocused]}
              placeholder="Search by title or author..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setCurrentPage(1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearchFocused && searchTerm.length > 0 && (
              <TouchableRipple
                onPress={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableRipple>
            )}
          </View>
        </AnimatedView>

        <AnimatedView animationType="fadeIn" duration={600} delay={200}>
          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableRipple
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonActive,
                ]}
              >
                <Animated.Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat === 'all' ? 'All' : cat}
                </Animated.Text>
              </TouchableRipple>
            ))}
          </View>
        </AnimatedView>
      </Animated.View>

      {/* Smooth Book List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array.from({ length: 6 })}
            renderItem={renderSkeleton}
            keyExtractor={(_, i) => `skeleton-${i}`}
            numColumns={2}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AnimatedView animationType="fadeIn" duration={500}>
                <Text style={styles.emptyText}>No books found</Text>
                {(searchTerm.length > 0 || selectedCategory !== 'all') && (
                  <TouchableRipple
                    onPress={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryButtonText}>Clear Filters</Text>
                  </TouchableRipple>
                )}
              </AnimatedView>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <AnimatedView animationType="fadeIn" duration={300}>
                <View style={styles.loader}>
                  <LoadingSpinner />
                </View>
              </AnimatedView>
            ) : filteredBooks.length > 0 ? (
              <AnimatedView animationType="fadeIn" duration={400}>
                <View style={styles.footer}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      // Scroll to top when page changes
                      if (page !== currentPage) {
                        setTimeout(() => {
                          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }, 100);
                      }
                    }}
                  />
                  <Text style={styles.footerText}>
                    Showing {filteredBooks.length} of {totalBooks} books
                  </Text>
                </View>
              </AnimatedView>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchIconText: {
    fontSize: 16,
    opacity: 0.5,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    paddingLeft: 44,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#495057',
  },
  searchInputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 122, 255, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 22,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 32,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    gap: 8,
  },
  bookItem: {
    marginBottom: 12,
  },
  skeletonItem: {
    marginBottom: 12,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
  },
  loader: {
    padding: 20,
    alignItems: 'center',
  },
});
