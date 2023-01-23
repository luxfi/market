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
  backgroundColor: '$gray3',
  color: '$gray12',
  p: '$3',
  '&:hover': {
    backgroundColor: '$gray4' 
  },
  '&[data-state=on]': { 
    backgroundColor: '$gray5' 
  },
})

export {
  StyledToggleGroupRoot as ToggleGroup,
  StyledToggleGroupItem as ToggleGroupItem,
  StyledToggleGroupRoot as ToggleGroupRoot,
}
