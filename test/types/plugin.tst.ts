import { expect } from 'tstyche'
import fastifyCasbin from '../../index.js'

expect(fastifyCasbin).type.not.toBe<undefined>()