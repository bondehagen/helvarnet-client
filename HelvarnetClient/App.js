
class HelvarNetService {

	setGroups(groups) {
		console.log("setGroups")
		this.groups = groups;
	}

	constructor() {
		console.log("HelvarNetService()");
		this.groups = [{"id": "1", "devices": [{"id": "device2"}]}, { "id": "2", "devices": [{"id": "device2"}]}];
		if (this.isConnected == true) {
			this.ws.close();
			return;
		}
		this.ws = new WebSocket('ws://localhost:3000');
		this.ws.onmessage = (msg) => {
			if(msg && msg.type == "message") {
				var data = JSON.parse(msg.data);
				this.setGroups(data.groups);
			}
		};
		this.ws.onopen = () => {
			console.log('opened');
			this.ws.send("status");
			this.isConnected = true;
		};
		this.ws.onclose = () => {
			console.log('closed');
			this.isConnected = false;
		};
		this.ws.onerror = (err) => {
			console.log('error')
			this.isConnected = false;
		};
	}

	send(device) {
		let tosend = "level:" + device;
		console.log("send: " + tosend);
		this.ws.send(tosend);
	}
}

class DetailPage {
	constructor(helvarNetService, group) {
		console.log("DetailPage()");
		this.devices = group.devices.map((device) => {
			return new Device(helvarNetService, device); 
		});
	}
}

class Device {
	constructor(helvarNetService, device) {
		this.helvarNetService = helvarNetService;
		Object.assign(this, device);
		this._light = true;
	}

	get light() {
		return this._light;
	}

	set light(value) {
		this._light = value;
		console.dir(this);
		if (value)
			this.helvarNetService.send(this.id.replace('@', '') + ",100");
		else
			this.helvarNetService.send(this.id.replace('@', '') + ",0");
	}
}

class MainPage {
	constructor (helvarNetService) {
		console.log("MainPage()");
		this.helvarNetService = helvarNetService;
	}

	get groups() {
		return this.helvarNetService.groups;
	}
}

export default class App {

	constructor() {
		console.log("App()");
		this._helvarNetService = new HelvarNetService();
		this.pages = [ new MainPage(this._helvarNetService) ];
	}

	selectGroup(args) {
		this.pages.push(new DetailPage(this._helvarNetService, args.data));
	}

	home() {
		this.pages.pop();
	}

	connect() {
		
	}
}
