const errors = {
  IPFS_ADD: (error?: Error) =>
    new Error('Error while adding the file to IPFS', { cause: error })
}

export default errors
