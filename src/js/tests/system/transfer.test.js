import Transfer from '../../osweb/system/transfer'
import Runner from '../../osweb/system/runner'
import { osexpString } from '../testExps'
import fs from 'fs'

const mockUpdateIntroScreen = jest.fn()
const mockUpdateProgressBar = jest.fn()
const mockAddMessage = jest.fn()
const mockAddError = jest.fn()
const mockPoolAdd = jest.fn()
const mockBuildFn = jest.fn()

jest.mock('../../osweb/system/runner', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _screen: {
        _updateIntroScreen: mockUpdateIntroScreen,
        _updateProgressBar: mockUpdateProgressBar
      },
      _debugger: {
        addMessage: mockAddMessage,
        addError: mockAddError
      },
      _pool: {
        add: mockPoolAdd
      },
      _build: mockBuildFn
    }
  })
})

const transfer = new Transfer(new Runner())

describe('Transfer module', () => {
  beforeEach(() => {
    Runner.mockClear()
    mockUpdateIntroScreen.mockClear()
    mockUpdateProgressBar.mockClear()
    mockAddMessage.mockClear()
    mockAddError.mockClear()
    mockPoolAdd.mockClear()
    mockBuildFn.mockClear()
  })

  describe('_readSource', () => {
    it('Should log an error if an invalid or no source is supplied', () => {
      const invalidParams = [null, true, 5, {}, [], new FileReader()]
      for (const param of invalidParams) {
        transfer._readSource(param)
      }
      expect(mockAddError).toHaveBeenCalledTimes(invalidParams.length)
    })
    it('Should update the status display', () => {
      transfer._readSource()
      expect(mockUpdateIntroScreen).toHaveBeenCalledTimes(1)
      expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(-1)
    })
  })

  describe('_readOsexpFromString', () => {
    it('Should throw an error if an invalid osexp representation is supplied', () => {
      expect(transfer._readOsexpFromString('abc')).rejects.toThrow()
    })

    it('Should set the script variable of the runner if an experiment has been successfully recognized', () => {
      expect(transfer._readOsexpFromString(osexpString)).resolves.toBe(true)
      expect(mockUpdateProgressBar).toHaveBeenCalledTimes(1)
      expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(100)
      expect(transfer._runner._script).toBe(osexpString)
    })

    it('Should be able to read osexp strings from files', async () => {
      const osexpFile = new File([osexpString], 'test.osexp')
      await expect(transfer._readOsexpFromString(osexpFile)).resolves.toBe(true)
      expect(mockUpdateProgressBar).toHaveBeenCalledTimes(1)
      expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(100)
      expect(transfer._runner._script).toBe(osexpString)
    })
  })

  describe('_readOsexpFromFile', () => {
    it('Should log an unsuccesful attempt to read osexp as a string', async () => {
      await expect(transfer._readOsexpFromFile('abc')).rejects.toThrow()
      expect(mockAddMessage).toHaveBeenCalledTimes(1)
    })

    // it('Should be able to read an osexp from a file', async () => {
    //   const osexpFile = fs.readFileSync('test-osexp/capybaras.osexp')
    //   const blob = new Blob([new Uint8Array(osexpFile)])
    //   console.log(blob)
    //   await expect(transfer._readOsexpFromFile(blob)).resolves.toBe(true)
    // })
  })

  describe('fetch', () => {
    it('Should throw an error if url is invalid or unavailable', async () => {
      await expect(transfer.fetch()).rejects.toThrow()
      await expect(transfer.fetch('nonsense')).rejects.toThrow()
    })
  })
})
