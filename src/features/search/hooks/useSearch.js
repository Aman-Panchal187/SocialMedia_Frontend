import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '../../../hooks/useDebounce'
import { searchApi } from '../../../api/searchApi'

export const RECENT_SEARCHES_QUERY_KEY = ['search', 'recent']

export function useSearchUsers(term) {
  const debouncedTerm = useDebounce(term, 300)
  const trimmedTerm = debouncedTerm.trim()

  return useQuery({
    queryKey: ['search', 'users', trimmedTerm],
    queryFn: () => searchApi.searchUsers(trimmedTerm),
    enabled: trimmedTerm.length > 0,
  })
}

export function useRecentSearches() {
  return useQuery({
    queryKey: RECENT_SEARCHES_QUERY_KEY,
    queryFn: () => searchApi.getRecentSearches(),
  })
}

export function useRecordSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (searchedUserId) => searchApi.recordSearch(searchedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_QUERY_KEY })
    },
  })
}

export function useDeleteRecentSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (searchedUserId) => searchApi.deleteRecentSearch(searchedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_QUERY_KEY })
    },
  })
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => searchApi.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_QUERY_KEY })
    },
  })
}

export function useSearch() {
  const [input, setInput] = useState('')
  const usersQuery = useSearchUsers(input)
  const recentQuery = useRecentSearches()

  const users = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data])
  const recent = useMemo(() => recentQuery.data?.data ?? [], [recentQuery.data])

  return {
    input,
    setInput,
    isSearching: input.trim().length > 0,
    usersQuery,
    recentQuery,
    users,
    recent,
  }
}
