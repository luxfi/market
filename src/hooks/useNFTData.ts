// Stubs — replace when @luxfi/hooks is published or inlined from its real source.
// Accept any args so pages that pass (chainId, address) etc. still typecheck.
type Empty = { data: never[]; isLoading: false; error: null }
const empty: Empty = { data: [], isLoading: false, error: null }

type NullData = { data: null; isLoading: false; error: null }
const nullData: NullData = { data: null, isLoading: false, error: null }

export const useCollections = (..._: unknown[]) => empty
export const useCollection = (..._: unknown[]) => nullData
export const useTokenInstances = (..._: unknown[]) => empty
export const useTokenInstance = (..._: unknown[]) => nullData
export const useTokenInstanceTransfers = (..._: unknown[]) => empty
export const useCollectionTransfers = (..._: unknown[]) => empty
export const usePortfolioNFTs = (..._: unknown[]) => empty
export const useSearchCollections = (..._: unknown[]) => empty
