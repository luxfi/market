import { styled } from 'stitches.config'
import {
  Root as ToggleGroupRoot,
  Item as ToggleGroupItem,
} from '@radix-ui/react-toggle-group'

const StyledToggleGroupRoot = styled(ToggleGroupRoot, {
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  gap: 1,
})

const StyledToggleGroupItem = styled(ToggleGroupItem, {
  backgroundColor: 'transparent',
  color: '$gray8',
  p: '$3',
  '&:hover': {
    backgroundColor: '$gray11' 
  },
  '&[data-state=on]': { 
    color: '$gray3',
    backgroundColor: '$gray11' 
  },
})

export {
  StyledToggleGroupRoot as ToggleGroup,
  StyledToggleGroupItem as ToggleGroupItem,
  StyledToggleGroupRoot as ToggleGroupRoot,
}
