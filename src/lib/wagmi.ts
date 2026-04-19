import { createConfig, http } from 'wagmi'
import { luxMainnet, zooMainnet, hanzoMainnet, spcMainnet, parsMainnet } from './chains'

export const config = createConfig({
  chains: [luxMainnet, zooMainnet, hanzoMainnet, spcMainnet, parsMainnet],
  transports: {
    [luxMainnet.id]: http(),
    [zooMainnet.id]: http(),
    [hanzoMainnet.id]: http(),
    [spcMainnet.id]: http(),
    [parsMainnet.id]: http(),
  },
})
