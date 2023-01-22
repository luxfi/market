import React from 'react'

import Flex from "./Flex"
import Text from "./Text"

const Value: React.FC<{
  type: string
  value: any
  size?: number
  fontSize?: number
}> = ({ 
  type, 
  value, 
  size = 11, 
  fontSize = 16 
}) => (
  <Flex align="center">
    <img
      style={{ width: size }}
      src={type === "weth" ? "/weth.png" : "/eth.png"}
    />
    {false && <Text css={{ fontFamily: "arial" }}>Ξ</Text>}
    <Text style="subtitle1" css={{ marginLeft: "$1", fontSize }}>
      {value || "---"}
    </Text>
  </Flex>
)

export default Value
