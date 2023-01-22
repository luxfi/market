import { FC } from 'react'
import Link from 'next/link'

import { 
  Text, 
  Box, 
  Flex, 
  Grid, 
  Button 
} from 'components/primitives'


const Hero: FC<{
  videoWidth: number,
  videoHeight: number,
  tokenHref: string,
  learnMoreHref: string
}> = ({
  videoWidth,
  videoHeight,
  tokenHref,
  learnMoreHref
}) => {

  return (
    <Flex 
      align='center'
      justify='center'
      direction='column'
      css={{
        backgroundColor: 'transparent'
      }}
    >
      <Text style='h4' css={{textAlign: 'center', color: '$gray2'}} >ALL-NEW ASSET-BACKEND NFTS</Text>
      <Text 
        style='h2'
        css={{
          textAlign: 'center',
          color: '$gray2'
        }}
      >LUX URANIUM NFT</Text>
      <Box css={{  mt: '$2' }} >
        <video 
          loop 
          muted 
          autoPlay 
          width={videoWidth}
          height={videoHeight}
          style={{ padding: 32, marginTop: -32 }} // :aa why?
        >
          <source src="./video/luxfinal1.mp4" type="video/mp4" />
        </video>
      </Box>
      <Flex direction='row' css={{ mt: '$2', gap: '$2'}} className="grid h-[100px] w-[380px] grid-cols-2 gap-4">
        <a href={learnMoreHref}>
          <Button variant='outlined' color='primary' className="mt-2 w-full dark:btn-outline-dk light:btn-outline">
            Learn More
          </Button>
        </a>
        <Link href={tokenHref}>
          <Button className="mt-2 w-full dark:btn-contained-white light:btn-outline">
            Buy Now
          </Button>
        </Link>
      </Flex>
    </Flex>
  )
}

export default Hero
