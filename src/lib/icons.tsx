// Rune Icons outline, https://github.com/Nexvyn/runeicons, Apache-2.0 (see rune-icons-LICENSE.txt).
// Ported from the 24th System; adapted to React props and currentColor.
import { createElement, type SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string }
type Shape = [string, Record<string, string>]

function icon(name: string, shapes: Shape[]) {
  return function RuneIcon({ size = 24, color = 'currentColor', strokeWidth = 1.5, ...props }: IconProps) {
    return createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'data-rune-icon': name,
        'aria-hidden': true,
        ...props,
      },
      shapes.map(([tag, attrs], key) => createElement(tag, { ...attrs, key })),
    )
  }
}

export const ArrowDown = icon('ArrowDown', [['path', { d: 'M12 5V19M5 12L12 19L19 12' }]])
export const ArrowLeft = icon('ArrowLeft', [['path', { d: 'M12 5L5 12L12 19M5 12H19' }]])
export const ArrowRight = icon('ArrowRight', [['path', { d: 'M5 12H19M12 19L19 12L12 5' }]])
export const ArrowUpRight = icon('ArrowUpRight', [['path', { d: 'M17 17V7H7M17 7L7 17' }]])
export const Check = icon('Check', [['path', { d: 'M20 6L9 17L4 12' }]])
export const ChevronDown = icon('ChevronDown', [['path', { d: 'M6 9L12 15L18 9' }]])
export const ChevronLeft = icon('ChevronLeft', [['path', { d: 'M15 18L9 12L15 6' }]])
export const ChevronRight = icon('ChevronRight', [['path', { d: 'M9 18L15 12L9 6' }]])
export const ChevronUp = icon('ChevronUp', [['path', { d: 'M18 15L12 9L6 15' }]])
export const CircleAlert = icon('CircleAlert', [['path', { d: 'M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' }]])
export const CircleCheck = icon('CircleCheck', [['path', { d: 'M9 12L11 14L15 10M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' }]])
export const Copy = icon('Copy', [['path', { d: 'M4 16C2.9 16 2 15.1 2 14V4C2 2.9 2.9 2 4 2H14C15.1 2 16 2.9 16 4M10 8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H10C8.89543 22 8 21.1046 8 20V10C8 8.89543 8.89543 8 10 8Z' }]])
export const Info = icon('Info', [['path', { d: 'M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' }]])
export const Minus = icon('Minus', [['path', { d: 'M5 12H19' }]])
export const Plus = icon('Plus', [['path', { d: 'M5 12H19M12 5V19' }]])
export const Grid = icon('Grid', [['path', { d: 'M3 9H21M3 15H21M9 3V21M15 3V21M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z' }]])
export const Search = icon('Search', [['path', { d: 'M20.9999 21.0002L16.6599 16.6602M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z' }]])
export const X = icon('X', [['path', { d: 'M18 6L6 18M6 6L18 18' }]])
export const PanelLeft = icon('PanelLeft', [['path', { d: 'M9 3V21M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z' }]])
export const MoreHorizontal = icon('MoreHorizontal', [
  ['path', { d: 'M12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10Z' }],
  ['path', { d: 'M19 10C19.5523 10 20 9.55228 20 9C20 8.44772 19.5523 8 19 8C18.4477 8 18 8.44772 18 9C18 9.55228 18.4477 10 19 10Z' }],
  ['path', { d: 'M5 10C5.55228 10 6 9.55228 6 9C6 8.44772 5.55228 8 5 8C4.44772 8 4 8.44772 4 9C4 9.55228 4.44772 10 5 10Z' }],
  ['path', { d: 'M12 16C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14C11.4477 14 11 14.4477 11 15C11 15.5523 11.4477 16 12 16Z' }],
  ['path', { d: 'M19 16C19.5523 16 20 15.5523 20 15C20 14.4477 19.5523 14 19 14C18.4477 14 18 14.4477 18 15C18 15.5523 18.4477 16 19 16Z' }],
  ['path', { d: 'M5 16C5.55228 16 6 15.5523 6 15C6 14.4477 5.55228 14 5 14C4.44772 14 4 14.4477 4 15C4 15.5523 4.44772 16 5 16Z' }],
])
