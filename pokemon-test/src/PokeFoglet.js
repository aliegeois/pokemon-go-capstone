const lmerge = require("lodash.merge");
const debug = require("debug")("template");

const { Foglet } = require('foglet-core');

class PokeFoglet extends Foglet {
  constructor(options, moc = false) {
    super();
    this.options = lmerge(
      {
        foglet: {
          verbose: true, // want some logs ? switch to false otherwise
          rps: {
            type: "cyclon",
            options: {
              protocol: "foglet-template", // foglet running on the protocol foglet-example, defined for spray-wrtc
              webrtc: {
                // add WebRTC options
                trickle: true, // enable trickle (divide offers in multiple small offers sent by pieces)
                config: { iceServers: [] } // define iceServers in non local instance
              },
              timeout: 2 * 1000, // spray-wrtc timeout before definitively close a WebRTC connection.
              pendingTimeout: 5 * 1000, // time before the connection timeout in neighborhood-wrtc
              delta: 1 * 1000, // spray-wrtc shuffle interval
              maxPeers: 100,
              a: 1, // for spray: a*ln(N) + b, inject a arcs
              b: 2, // for spray: a*ln(N) + b, inject b arcs
              signaling: {
                address: "https://signaling.herokuapp.com/",
                // signalingAdress: 'https://signaling.herokuapp.com/', // address of the signaling server
                room: "room-foglet-template" // room to join
              }
            }
          },
          overlays: [],
          ssh: undefined /* {
          address: 'http://localhost:4000/'
        } */
        }
      },
      options
    );
    // if moc === true we use a WebRTC moc for the rps, still webrtc connection for the overlay, dont use the same moc!!
    if (moc) {
      this.options.foglet.rps.options.socketClass = require("foglet-core").SimplePeerMoc;
    }
    this.foglet = new Foglet(this.options.foglet);

    this.foglet.overlay().network.rps.on("open", id => {
      debug("[%s] connection opened on the rps: ", this.foglet.inViewID, id);
      this.emit("rps-open", id);
    });

    this.foglet.overlay().network.rps.on("close", id => {
      debug("[%s] connection closed on the rps: ", this.foglet.inViewID, id);
      this.emit("rps-close", id);
    });

    // Handle unicasts
    // this.handleUnicast();
    this.handlers = {};

    debug("Template initialized.");

    // Added functionalities ______________________________
    this.targets = [];

    this.on("descriptor-updated", descriptor => {
      // TOCHANGE
      const myDescriptor = descriptor.descriptor;
      this.targets.forEach(target => {
        // 1. check if target withing my perimeter
        if (target.isNearby(myDescriptor)) {
          // 2. if within, check if i already have it
          if (this.foglet.overlay(target.id)) return;
          this.buildOverlay(
            lmerge(target.getOverlay(), {
              options: {
                descriptor: myDescriptor
              }
            })
          );
        } else {
          if (this.foglet.overlay(target.id)) {
            console.log("leave overlay");
            this.leaveOverlay(target.id, target);
          }
        }
        // broadcast to everyone that i am not there anymore?
      });
    });
  }

  sendOverlayUnicast(overlay, id, message) {
    message.context = overlay;
    return this.foglet.overlay(overlay).communication.sendUnicast(id, message);
  }

  sendOverlayUnicastAll(overlay, message) {
    this.neighboursOverlay(overlay).forEach(peer => {
      this.sendOverlayUnicast(overlay, peer, message);
    });
  }

  neighboursOverlay(overlay) {
    return this.foglet.overlay(overlay).network.getNeighbours();
  }

  //Utilisé dans un eventemitter
  buildOverlay(overlay) {
    this.foglet._networkManager._buildOverlay(overlay);
    this.foglet.overlay(overlay.name).network.rps.on("open", id => {
      debug("[%s] connection opened on the rps: ", this.foglet.inViewID, id);
      this.emit(overlay.name + "-open", id);
      this.emit("overlay-open", overlay.name);
    });

    this.foglet.overlay(overlay.name).network.rps.on("close", id => {
      debug("[%s] connection closed on the rps: ", this.foglet.inViewID, id);
      this.emit(overlay.name + "-close", id);
      this.emit("overlay-close", overlay.name);
    });

    this.foglet.overlay(overlay.name)._network._rps._start();
    return Promise.resolve();
  }

  //Utilisé dans un eventemitter
  leaveOverlay(overlay, target) {
    this.foglet
      .overlay(overlay)
      ._network.getNeighbours()
      .forEach(peerId => {
        this.foglet.overlay(overlay)._network._rps.disconnect(peerId);
      });
    // console.log(this.foglet._networkManager.overlay()._network.rps.NO.protocols)
    // this.foglet._networkManager.overlay(overlay)._network.rps.NO.protocols.delete(overlay)
    // this.foglet._networkManager.overlay()._network.rps.NO.protocols.delete(overlay)
    // console.log(this.foglet._networkManager.overlay()._network.rps.NO.protocols)
    // this.foglet._networkManager._overlays.clear()
    return Promise.resolve();
  }

  addHandler(event, handler, overlay) {
    if (!this.handlers[overlay]) {
      this.handlers[overlay] = {};
    }
    if (this.handlers[overlay][event]) {
      this.handlers[overlay][event].push(handler);
    } else {
      this.handlers[overlay][event] = [handler];
    }
  }
}

module.exports = PokeFoglet;
