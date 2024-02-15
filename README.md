# Jamtop (WIP)

Jamtop is brings the Spotify Jam functionality to desktop. Users can host their own room and listen to along with friends. Join a synchronized playlist where everyone can add their own songs.

![]
(https://github.com/RichieVu/Jamtop/blob/master/public/host_demo.gif)

## MoSCoW

### Must have

- [x] Users can create unique rooms
- [x] Users can see the room queue
- [x] Have one host per room
- [ ] Current music is synced for all users
- [ ] Current queue is synced for all users

### Should have

- [ ] Playback control (pause/play, prev/next)
- [ ] Clear queue button
- [ ] Relog button

### Could have

- [ ] Individual song in queue control

### Won't have

- [ ] Support for non-premium users (due to Spotify API)

## Build with

- Node.js - Server framework
- Express - Server to handle HTTP requests
  - Express session - Middleware session management
- Socket.io - Real-time communication and room events
- Spotify Web API
