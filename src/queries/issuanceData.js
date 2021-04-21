import gql from 'graphql-tag'
import { GraphQLWrapper } from '@aragon/connect-thegraph'

import { getTimestampForMonthsAgo } from '../utils/utils'

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/onbjerg/honey'
const graphqlClient = new GraphQLWrapper(SUBGRAPH_URL)

const oldCommonPoolAddress = '0x05e42c4ae51ba28d8acf8c371009ad7138312ca4'
const newCommonPoolAddress = '0x4ba7362f9189572cbb1216819a45aba0d0b2d1cb'
const honeyMakerAddress = '0x076b64f9f966e3bbd0fcdc79d490ab71cf961bb0'
const zeroAddress = '0x0000000000000000000000000000000000000000'
const queryOrderingParams = 'orderBy: timestamp, orderDirection: asc'

const timestampLast = Math.round(Date.now() / 1000)
const timestampChange = 1618096125
const timestampFirst = getTimestampForMonthsAgo(9)

const TOTAL_SUPPLY_QUERY = gql`
  query TotalSupplyQuery {
    holder(id: "${zeroAddress}") {
      amount
    }
  }
`

const MINT_QUERY = gql`
  query MintQuery {
    transfers(where: {from: "${zeroAddress}", to: "${oldCommonPoolAddress}", timestamp_gte: ${timestampFirst}}, first: 1000, ${queryOrderingParams}) {
      amount
      timestamp
    }
  }
`

const BURN_QUERY = gql`
  query BurnQuery {
    transfers(where: {from: "${oldCommonPoolAddress}", to: "${zeroAddress}", timestamp_gte: ${timestampFirst}}, first: 1000, ${queryOrderingParams}) {
      amount
      timestamp
    }
  }
`

const INFLOWS_QUERY = gql`
  query InflowsQuery($skip: Int) {
    transfers(where: {from: "${honeyMakerAddress}", to: "${oldCommonPoolAddress}", timestamp_gte: ${timestampFirst}}, first: 1000, skip: $skip, ${queryOrderingParams}) {
      amount
      timestamp
    }
  }
`

const OLD_ADDRESS_OUTFLOWS_QUERY = gql`
  query OldAddressOutflowsQuery {
    transfers(where: {from: "${oldCommonPoolAddress}", to_not: "${zeroAddress}", timestamp_gte: ${timestampFirst}, timestamp_lt: ${timestampChange}}, first: 1000 ${queryOrderingParams}) {
      amount
      timestamp
    }
  }
`

const NEW_ADDRESS_OUTFLOWS_QUERY = gql`
  query NewAddressOutflowsQuery {
    transfers(where: {from: "${newCommonPoolAddress}", to_not: "${zeroAddress}", timestamp_gt: ${timestampChange}}, first: 1000 ${queryOrderingParams}) {
      amount
      timestamp
    }
  }
`

export const fetchTotalSupply = async () => {
  try {
    const response = await graphqlClient.performQuery(TOTAL_SUPPLY_QUERY)
    const totalSupply = response.data.holder.amount
    return +parseFloat(Math.abs(+totalSupply / 10 ** 18)).toFixed(4)
  } catch (err) {
    console.log(err)
  }
}

export const fetchMintData = async () => {
  try {
    const response = await graphqlClient.performQuery(MINT_QUERY)
    return response.data.transfers
  } catch (err) {
    console.log(err)
  }
}

export const fetchBurnData = async () => {
  try {
    const response = await graphqlClient.performQuery(BURN_QUERY)
    return response.data.transfers
  } catch (err) {
    console.log(err)
  }
}

export const fetchInflowsData = async () => {
  try {
    const inflows = []
    let skip = 0
    
    while (true) {
      const response = await graphqlClient.performQuery(INFLOWS_QUERY, { "skip": skip })
      if (!response.data.transfers.length) break
      else {
        inflows.push(...response.data.transfers)
        skip += 1000
      }
    }

    return inflows
  } catch (err) {
    console.log(err)
  }
}

export const fetchOutflowsData = async () => {
  try {
    let outflows = []
    
    if (timestampFirst < timestampChange) {
      const response = await graphqlClient.performQuery(OLD_ADDRESS_OUTFLOWS_QUERY)
      outflows.push(...response.data.transfers)
    }
    if (timestampLast > timestampChange) {
      const response = await graphqlClient.performQuery(NEW_ADDRESS_OUTFLOWS_QUERY)
      outflows.push(...response.data.transfers)
    }
    
    return outflows
  } catch (err) {
    console.log(err)
  }
}