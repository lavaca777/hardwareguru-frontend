import { USE_MOCKS } from '@/config'
import * as mocks from './mocks'
import * as real from './real'

export const api = USE_MOCKS ? mocks : real
