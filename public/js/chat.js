const socket = io();

const form = document.querySelector("#message-form");
const locationButton = document.querySelector("#send-location");
const input = form.querySelector("input");
const sendButton = form.querySelector("button");
const messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationUrlTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});


const autoscroll = ()=>{
  const newMessage = messages.lastElementChild

  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = newMessage.offsetHeight + newMessageMargin

const visibleHeight = messages.offsetHeight

const contentHeight =  messages.scrollHeight

const scrollOffset = messages.scrollTop + visibleHeight

if(contentHeight - newMessageHeight >= scrollOffset){
  //console.log(newMessageMargin);
  messages.scrollTop = messages.scrollHeight
}




}
socket.on("message", (msg) => {
  // console.log(msg);
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    username: msg.username,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("locationMessage", (location) => {
  //console.log(location);
  const html = Mustache.render(locationUrlTemplate, {
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
    username: location.username,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("roomData", ({ room, users }) => {
  //console.log(users);

  const html = Mustache.render(sidebarTemplate, {
    room,
    users: users.user,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendButton.setAttribute("disabled", "disabled");
  const msessage = input.value;
  socket.emit("sendMessage", msessage, (error) => {
    sendButton.removeAttribute("disabled");
    input.value = "";
    input.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message delivered !");
  });
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geo Location is not supported by browser");
  }
  locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("sendLocation", location, (msg) => {
      locationButton.removeAttribute("disabled");
      //console.log(msg);
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
