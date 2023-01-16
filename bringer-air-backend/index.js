require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')
const bearerToken = process.env.BEARER_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJpYXQiOjE2NzIzMjY1NTUsImV4cCI6MTcwMzg2MjU1NSwiYXVkIjoiaHR0cHM6Ly9icmluZ2VycGFyY2VsLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiNTI1eXM2YWh4d3UyIiwianRpIjoiZDdlZGE3NDgtNzMxOS00YWIzLWI2MGEtMDEzMzI0NmVkNmY2In0.uJi6d6-E2zDWj24wryh2sVWKs4ceny4QllbrHrzK5L0'

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('---')
    next()
}
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())  
app.use(requestLogger)
app.use(express.static('build'))

app.get('/tracking/:id', async (request,response) => {
    const id = request.params.id
     try{
        const parsedEvents = []
        const res = await axios.get(`https://bps.bringer.io/public/api/v2/get/parcel/tracking.json?tracking_number=${id}`, {
            headers: {
              'Authorization': `Bearer ${bearerToken}`
            }
          })
        const data = await res.data
        const allEventsData  = data.parcel_tracking_items

        allEventsData.map(event =>{
            //data parsing
            const eventTimeStamp = new Date(event.timestamp)
  
            const options = { month: "short" };
            const [monthName, day, fullYear] = 
            [
              new Intl.DateTimeFormat("en-US", options).format(eventTimeStamp),
              eventTimeStamp.getDate(),
              eventTimeStamp.getFullYear()
            ]
          
            const eventDate = monthName.concat(" ", day, ", ", fullYear)
            const eventTime = eventTimeStamp.toLocaleTimeString('en-US',{hour: '2-digit', minute:'2-digit'})
            let eventLocation = ''
            let eventStatus = ''
            const vendor_tracking_code = event
            if(event.trackingCodeId==null){
                const state = event.state ? event.state+', ': ''
                const city = event.city ? event.city+', ':''
              eventLocation = event.location + ", "  + state + city + event.country.isoCode 
              eventStatus = event.tracking_code_vendor.tracking_code.tracking_code_locales[0].description
            
            }else {
              eventLocation = event.state + ", "  + event.city + ", " + event.country.isoCode 
              eventStatus = event.tracking_code.tracking_code_locales[0].description
            }
  
            const newEvent = {
              myid: event.id,
              status: eventStatus,
              location: eventLocation,
              eventDate: eventDate,
              eventTime: eventTime 
            }

            parsedEvents.push(newEvent)
          } )
    response.send(parsedEvents)
    } catch(err){
        response.status(400).json({error: 'id not found'})
    }
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})