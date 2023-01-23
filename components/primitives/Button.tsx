import { styled } from 'stitches.config'

const Button = styled('button', {
  outline: 'none',
  fontWeight: 700,
  fontSize: 16,
  fontFamily: '$button',
  transition: 'background-color 100ms linear',
  gap: '$space$2',
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: '20px',
  /*
  $$focusColor: '$colors$gray12',
  '&:focus-visible': {
    boxShadow: '0 0 0 2px $$focusColor',
  },
  */
  '&:disabled': {
    backgroundColor: '$gray8',
    color: '$gray11',
  },
  '&:disabled:hover': {
    backgroundColor: '$gray8',
    color: '$gray11',
  },
  variants: {
    
    variant: {
      contained: {

      },
      outlined: {
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: '1px'
      }
    },
    color: {
      primary: {
        backgroundColor: '$primary3',
        border: '1px solid $primary3',
        color: '$primary12',
        '&:hover': {
          color: '$primary12',
          borderColor: '$primary1',
          backgroundColor: '$primary1',
        },
      },
      secondary: {
        backgroundColor: '$secondary3',
        border: '1px solid $secondary3',
        color: '$secondary12',
        '&:hover': {
          color: '$primary12',
          borderColor: '$primary3',
          backgroundColor: '$primary3',
        },
      },
      gray3: {
        backgroundColor: '$gray3',
        color: '$gray12',
        '&:hover': {
          backgroundColor: '$gray5',
        },
      },
      gray4: {
        backgroundColor: '$gray4',
        color: '$gray12',
        '&:hover': {
          backgroundColor: '$gray6',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$gray1',
        p: 0,
      },
    },
    corners: {
      square: {
        borderRadius: 0,
      },
      rounded: {
        borderRadius: 10,
      },
      pill: {
        borderRadius: 99999,
      },
      circle: {
        borderRadius: '99999px',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    size: {
      xs: {
        p: '$space$3',
        lineHeight: '16px',
        minHeight: 40,
      },
      small: {
        px: '$space$3',
        py: '$space$4',
        lineHeight: '12px',
        minHeight: 44,
      },
      medium: {
        px: '$space$5',
        py: '$space$3',
        minHeight: 44,
      },
      large: {
        px: '$space$5',
        py: '$space$4',
        minHeight: 52,
      },
    },
  },
  compoundVariants: [
    {
      size: 'xs',
      corners: 'circle',
      css: {
        height: 40,
        width: 40,
        p: 0,
      },
    },
    {
      size: 'small',
      corners: 'circle',
      css: {
        height: 44,
        width: 44,
        p: 0,
      },
    },
    {
      size: 'medium',
      corners: 'circle',
      css: {
        height: 44,
        width: 44,
        p: 0,
      },
    },
    {
      size: 'large',
      corners: 'circle',
      css: {
        height: 52,
        width: 52,
        p: 0,
      },
    },
    {
      variant: 'outlined',
      color: 'primary',
      css: {
        borderColor: '$primary4',
        color: '$primary4', 
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: '1px',
        outline: '0.5px solid $primary12',
        '&:hover': {
          backgroundColor: '$primary12',
          color: '$primary1', 
          outlineColor: '$primary1',
          borderColor: '$primary1',
        },
      }
    },
    {
      variant: 'outlined',
      color: 'secondary',
      css: {
        borderColor: '$secondary4',
        color: '$secondary4', 
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: '1px',
        outline: '0.5px solid $secondary12',
        '&:hover': {
          backgroundColor: '$secondary12',
          color: '$secondary1', 
          outlineColor: '$secondary1',
          borderColor: '$secondary1',
        },
      }
    }

  ],
  defaultVariants: {
    color: 'primary',
    variant: 'contained',
    corners: 'rounded',
    size: 'medium',
  },
})

export default Button
