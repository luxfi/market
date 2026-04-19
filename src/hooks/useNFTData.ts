// Stubs — replace when @luxfi/hooks is published or inlined from its real source.
// Return a shape that looks like the real paginated response so consumers don't break.

type Paginated<T = unknown> = { items: T[]; next_page_params: null }
const emptyPage = <T,>(): { data: Paginated<T>; isLoading: false; error: null } => ({
  data: { items: [], next_page_params: null },
  isLoading: false,
  error: null,
})

const nullRow = { data: null, isLoading: false as const, error: null }

export const useCollections = (..._: unknown[]) => emptyPage()
export const useCollection = (..._: unknown[]) => nullRow
export const useTokenInstances = (..._: unknown[]) => emptyPage()
export const useTokenInstance = (..._: unknown[]) => nullRow
export const useTokenInstanceTransfers = (..._: unknown[]) => emptyPage()
export const useCollectionTransfers = (..._: unknown[]) => emptyPage()
export const usePortfolioNFTs = (..._: unknown[]) => emptyPage()
export const useSearchCollections = (..._: unknown[]) => emptyPage()
