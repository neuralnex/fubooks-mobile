import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Show page numbers around current page
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.disabledButton]}
        onPress={handlePrevious}
        disabled={currentPage === 1}
      >
        <Text style={[styles.buttonText, currentPage === 1 && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        {startPage > 1 && (
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.activePage]}
            onPress={() => onPageChange(1)}
          >
            <Text style={[styles.pageText, currentPage === 1 && styles.activeText]}>
              1
            </Text>
          </TouchableOpacity>
        )}
        {startPage > 2 && (
          <Text style={styles.dots}>...</Text>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (page) => (
            <TouchableOpacity
              key={page}
              style={[styles.pageButton, currentPage === page && styles.activePage]}
              onPress={() => onPageChange(page)}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activeText]}>
                {page}
              </Text>
            </TouchableOpacity>
          )
        )}

        {endPage < totalPages - 1 && (
          <Text style={styles.dots}>...</Text>
        )}
        {endPage < totalPages && (
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.activePage]}
            onPress={() => onPageChange(totalPages)}
          >
            <Text style={[styles.pageText, currentPage === totalPages && styles.activeText]}>
              {totalPages}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.disabledButton]}
        onPress={handleNext}
        disabled={currentPage === totalPages}
      >
        <Text style={[styles.buttonText, currentPage === totalPages && styles.disabledText]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  disabledText: {
    color: '#999',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  activePage: {
    backgroundColor: '#007AFF',
  },
  activeText: {
    color: '#fff',
  },
  dots: {
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 4,
  },
});

export default Pagination;
