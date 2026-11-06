import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  AlertTriangleIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  CpuIcon,
  GridIcon,
  InfoIcon,
  LayoutIcon,
  MenuIcon,
  ReloadIcon,
  SearchIcon,
  StackIcon,
  UserIcon,
} from '../icons'

const icons = {
  AlertTriangleIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  CpuIcon,
  GridIcon,
  InfoIcon,
  LayoutIcon,
  MenuIcon,
  ReloadIcon,
  SearchIcon,
  StackIcon,
  UserIcon,
}

describe('iconos', () => {
  it('renderiza todos los iconos como svg', () => {
    render(
      <>
        {Object.entries(icons).map(([name, Icon]) => (
          <Icon key={name} data-testid={name} />
        ))}
      </>,
    )

    for (const name of Object.keys(icons)) {
      expect(screen.getByTestId(name).tagName).toBe('svg')
    }
  })
})
