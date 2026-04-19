// Stubs — replace when @luxfi/hooks is published or inlined from its real source
type Empty = { data: never[]; isLoading: false; error: null }
const empty: Empty = { data: [], isLoading: false, error: null }

export const useCollections = () => empty
export const useCollection = (_id: string) => ({ ...empty, data: null })
export const useTokenInstances = () => empty
export const useTokenInstance = () => ({ ...empty, data: null })
export const useTokenInstanceTransfers = () => empty
export const useCollectionTransfers = () => empty
export const usePortfolioNFTs = () => empty
export const useSearchCollections = () => empty
