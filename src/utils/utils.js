export const getTimestampForMonthsAgo = months => {
  const now = new Date()
  const todayTimestamp = (now.setHours(0, 0, 0, 0))
  const today = new Date(todayTimestamp)
  const currentMonth = today.getMonth()

  const newMonth = currentMonth - months

  if (newMonth >= 0) return Math.ceil(today.setMonth(newMonth) / 1000)
  else {
    const year = today.getFullYear()
    const timestamp = today.setFullYear(
      year - Math.ceil(months / 12),
      12 + currentMonth - months,
      1
    )
    
    return Math.ceil(timestamp / 1000)
  }
}

export const formatData = (data, valueName) => {
  const formattedArray = data.map(entry => {
    const date = new Date(entry.timestamp * 1000)

    const formattedDate = [
      date.getFullYear(),
      ('0' + (date.getMonth() + 1)).slice(-2),
      // ('0' + date.getDate()).slice(-2)
    ].join('-')

    const formattedAmount = +parseFloat(entry.amount / 10 ** 18).toFixed(4)

    return { date: formattedDate, [valueName]: formattedAmount }
  })

  const grouppedArray = []

  for (let entry of formattedArray) {
    if (grouppedArray.length === 0 || !grouppedArray.some(e => e.date === entry.date)) 
      grouppedArray.push({ date: entry.date, [valueName]: entry[valueName] })
    else {
      const newValueEntry = grouppedArray[grouppedArray.findIndex(e => e.date === entry.date)]
      newValueEntry[valueName] = +parseFloat(newValueEntry[valueName] + entry[valueName]).toFixed(4)
    }
  }

  return grouppedArray
}

export const adjustColor = (color, amount) => {
  return '#' + color
  .replace(/^#/, '')
  .replace(
    /../g, 
    color => ('0'+ Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  )
}