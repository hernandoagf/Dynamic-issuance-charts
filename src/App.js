import { useState, useEffect } from 'react'

import BarChart from './components/BarChart'
import './App.css'
import { fetchInflowsData, fetchOutflowsData } from './queries/issuanceData'
import { formatData } from './utils/utils'

function App() {
  const [ netFlow, setNetFlow ] = useState()
  const [ netFlowKeys, setNetFlowKeys ] = useState()

  useEffect(() => fetchNetFlowData(), [])

  const fetchNetFlowData = async () => {
    const inflows = await fetchInflowsData()
    const outflows = await fetchOutflowsData()
      
    const formattedInflows = formatData(inflows, 'inflows')
    const formattedOutflows = formatData(outflows, 'outflows')
      
    const inflowsVOutflows = formattedOutflows.map(entry => {
      const inflowIndex = formattedInflows.findIndex(inf => inf.date === entry.date)
      const inflows = inflowIndex < 0 ? 0 : formattedInflows[inflowIndex].inflows
  
      return {
        date: entry.date,
        Inflows: inflows,
        Outflows: entry.outflows
      }
    })

    setNetFlow(inflowsVOutflows)
    setNetFlowKeys(Object.keys(inflowsVOutflows[0]).slice(1).reverse())
  }

  return (
    <div className="App">
      {netFlow && netFlowKeys 
      ? (
        <BarChart 
          dataArray={netFlow}
          keys={netFlowKeys}
          top={10}
          right={50}
          bottom={50}
          left={50}
          width={800}
          height={400}
          fill1="#FF9B73"
          fill2="#7CE0D6"
          axisColor="rgba(0, 0, 0, 0.6)"
      />) 
      : (<div />)
      }
    </div>
  );
}

export default App
