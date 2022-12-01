/* eslint-disable @typescript-eslint/no-explicit-any */
let mockAdd = jest.fn(() => {})
let mockAddAll = jest.fn(() => {})
let mockLs = jest.fn(() => {})
let mockCat = jest.fn(() => {})

const create = function () {
  return {
    add: mockAdd,
    addAll: mockAddAll,
    ls: mockLs,
    cat: mockCat
  }
}

const globSource = jest.fn(() => {})

function __setMockAdd(mock: any) {
  mockAdd = mock
}

function __setMockAddAll(mock: any) {
  mockAddAll = mock
}

function __setMockLs(mock: any) {
  mockLs = mock
}

function __setMockCat(mock: any) {
  mockCat = mock
}

function __resetIPFSMocks() {
  mockAdd = jest.fn(() => {})
  mockAddAll = jest.fn(() => {})
  mockLs = jest.fn(() => {})
  mockCat = jest.fn(() => {})
}

export {
  create,
  globSource,
  __setMockAdd,
  __resetIPFSMocks,
  __setMockAddAll,
  __setMockLs,
  __setMockCat
}
