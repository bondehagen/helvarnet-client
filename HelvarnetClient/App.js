
class HelvarNetService {

	setGroups(groups) {
		this.groups = groups;
	}

	constructor() {
		console.log("HelvarNetService()");
		this.groups = [];
		if (this.isConnected == true) {
			this.ws.close();
			return;
		}
		this.ws = new WebSocket('ws://192.168.1.187:3000');
		this.ws.onmessage = (msg) => {
			if (msg && msg.type == "message") {
				var data = JSON.parse(msg.data);
				this.setGroups(data.groups.map((g) => {
					return new Group(this, g);
				}));
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

	send(tosend) {
		console.log("send: " + tosend);
		this.ws.send(tosend);
	}
}

class DetailPage {
	constructor(helvarNetService, group) {
		console.log("DetailPage()");
		this.devices = group.devices.filter((device) => {
			return (device.type == 1537);
		}).map((device) => {
			return new Device(helvarNetService, device);
		});
	}
}
class Group {
	constructor(helvarNetService, group) {
		this.helvarNetService = helvarNetService;
		Object.assign(this, group);
		this._light = true;
	}

	get light() {
		return this._light;
	}

	set light(value) {
		this._light = value;
		if (value)
			this.helvarNetService.send("group_level:" + this.id + ",100,0");
		else
			this.helvarNetService.send("group_level:" + this.id + ",0,0");
	}
}
class Device {
	constructor(helvarNetService, device) {
		this.helvarNetService = helvarNetService;
		Object.assign(this, device);
		this._light = 100;
	}

	get light() {
		return this._light;
	}

	set light(value) {
		this._light = value;
		this.helvarNetService.send("device_level:" + this.id.replace('@', '') + "," + value + ",0");
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
		if (this.pages.length > 1)
			this.pages.pop();
	}

	connect() {
		this._helvarNetService = new HelvarNetService();
	}
}
