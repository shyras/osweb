import Transfer from '../../osweb/system/transfer'
import Runner from '../../osweb/system/runner'
import { osexpString } from '../_helpers/testExps'

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

describe('Transfer class', () => {
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
        expect(transfer._readSource(param)).rejects.toThrow()
      }
    })
  })

  describe('_readOsexpFromString', () => {
    it('Should throw an error if an invalid osexp representation is supplied', () => {
      expect(transfer._readOsexpFromString('abc')).rejects.toThrow()
    })

    it('Should recognize a valid script and update the status bar', () => {
      expect(transfer._readOsexpFromString(osexpString)).resolves.toBe(osexpString)
      expect(mockUpdateProgressBar).toHaveBeenCalledTimes(1)
      expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(100)
    })

    it('Should be able to read osexp strings from files', async () => {
      const osexpFile = new File([osexpString], 'test.osexp')
      await expect(transfer._readOsexpFromFile(osexpFile)).resolves.toBe(osexpString)
      expect(mockUpdateProgressBar).toHaveBeenCalledTimes(1)
      expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(100)
    })
  })

  describe('_readOsexpFromFile', () => {
    it('Should log an unsuccesful attempt to read osexp as a string', async () => {
      await expect(transfer._readOsexpFromFile('abc')).rejects.toThrow()
      expect(mockAddMessage).toHaveBeenCalledTimes(1)
    })

    // it('Should be able to read binary osexp files', async () => {
    //   const osexpFile = fs.readFileSync('test-osexp/capybaras.osexp')
    //   const blob = new Blob([new Uint8Array(osexpFile)])
    //   console.log(blob)
    //   await expect(transfer._readOsexpFromFile(blob)).resolves.toBe(true)
    // })
  })

  describe('fetch', () => {
    it('Should throw an error if url is invalid or unavailable', async () => {
      await expect(transfer.fetch()).rejects.toThrow()
    })
  })
})
