import { NetworkManager } from "./network.mjs";
import { PhysicsModule } from "./physics.mjs";

export class Engine {
    constructor(io) {
        this.modules = {};
        this.io = io;

        this.dt = 0;
        this.lastUpdate = performance.now();

        this.#loadModules();

        setInterval(() => {
            this.update();
        }, 1000 / 60);
    }

    #loadModules() {
        this.modules.networkManager = new NetworkManager(this, this.io);
        this.modules.physicsModule = new PhysicsModule(this);
    }

    update() {
        this.dt = performance.now() - this.lastUpdate;
        this.lastUpdate = performance.now();

        for (let module in this.modules) {
            if (typeof this.modules[module].update === "function") {
                this.modules[module].update(this.dt);
            }

            else {
                throw new Error(`Module ${module} does not have an update function`);
            }
        }
    }
}
