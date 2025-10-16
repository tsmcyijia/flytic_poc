export default function FlightCard({ item }) {
  const segments = item.segments || []

  const parseDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return 0
    return (parseInt(match[1] || 0, 10) * 60) + parseInt(match[2] || 0, 10)
  }

  const totalMinutes =
    item.total_flight_minutes || segments.reduce((acc, segment) => acc + parseDuration(segment.duration || ''), 0)
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
  const totalTrip = item.total_trip_minutes
    ? `${Math.floor(item.total_trip_minutes / 60)}h ${Math.round(item.total_trip_minutes % 60)}m`
    : totalHours

  return (
    <article className="flight-card">
      <div className="flight-card-header">
        <div>
          <div className="flight-route">
            {item.origin} → {item.destination}
          </div>
          <div className="flight-meta">
            出發 {item.departure} → 抵達 {item.arrival}
          </div>
          <div className="flight-meta">
            總飛行時間：{totalHours} ｜ 總旅行時間：{totalTrip}
          </div>
        </div>
        <div className="flight-price">
          {item.currency} {item.price}
        </div>
      </div>
      <div>
        {segments.map((segment, index) => {
          const next = segments[index + 1]
          let layover = null
          if (next) {
            const departure = new Date(segment.arrival)
            const arrival = new Date(next.departure)
            const diff = Math.round((arrival - departure) / 60000)
            layover = `${Math.floor(diff / 60)}h ${diff % 60}m`
          }

          return (
            <div key={index} className="flight-segment">
              <div className="flight-time">
                {segment.origin} → {segment.destination} {segment.carrier}
                {segment.flightNumber && ` ${segment.flightNumber}`}
              </div>
              <div className="flight-meta">
                {segment.departure} → {segment.arrival} ｜ 飛行時間：{segment.duration?.replace('PT', '').toLowerCase()}
              </div>
              {layover && <div className="flight-layover">轉機於 {segment.destination}，停留 {layover}</div>}
            </div>
          )
        })}
      </div>
    </article>
  )
}
