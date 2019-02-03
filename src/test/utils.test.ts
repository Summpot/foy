import { task } from '../task'
import { fs } from '../fs'
import { exec } from '../exec'
import * as path from 'path'
import { hashAny, namespacify } from '../utils'

describe('utils', function() {
  it('hashAny', () => {
    expect(hashAny('aa')).toEqual( '📝aa')
    expect(hashAny(1)).toEqual( '1')
    expect(hashAny(null)).toEqual( 'null')
    expect(hashAny(undefined)).toEqual( 'undefined')
    let fn = f => f
    expect(hashAny(fn)).toEqual( hashAny(fn))
    expect(hashAny(fn)).toEqual( '⭕️1')
    expect(hashAny(fn)).not.toEqual(hashAny(f => f))
    class A {}
    expect(hashAny({ aa: fn, bb: new A() })).toEqual('Object{"aa":"⭕️1","bb":"A{}"}')
    expect(hashAny({ aa: fn })).toEqual( 'Object{"aa":"⭕️1"}')
    expect(hashAny({ aa: fn })).toEqual( hashAny({ aa: fn }))
    expect(hashAny({ aa: fn })).not.toEqual(hashAny({ aa: f => f }))
  })

  it('namespacify', async () => {
    let a = namespacify({
      aa: { bb: { cc: '123', dd: null }, cc: '123', dd: null },
      cc: 'dd',
      ff: '123',
      dd: null,
    })

    expect(a).toEqual({
      aa: {
        bb: {
          cc: 'aa:bb:123',
          dd: 'aa:bb:dd',
        },
        cc: 'aa:123',
        dd: 'aa:dd',
      },
      cc: 'dd',
      ff: '123',
      dd: 'dd',
    })

    expect(
      namespacify({ aa: null, bb: { cc: null } }, 'prefix', '|')
    ).toEqual(
      { aa: 'prefix|aa', bb: { cc: 'prefix|bb|cc' } }
    )
  })
})
