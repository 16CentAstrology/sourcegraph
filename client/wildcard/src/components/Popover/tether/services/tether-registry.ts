import { render } from './tether-render'
import type { Tether } from './types'

interface TetherAPIObject {
    tethers: TetherInstanceAPI[]
    registerTether: (tether: TetherInstanceAPI) => void
    unregisterTether: (tether: TetherInstanceAPI) => void
    update: () => void
}

export const TetherAPI: TetherAPIObject = {
    tethers: [],

    registerTether(tether: TetherInstanceAPI) {
        this.tethers.push(tether)
    },

    unregisterTether(tether: TetherInstanceAPI) {
        TetherAPI.tethers = TetherAPI.tethers.filter(tetherAPI => tetherAPI !== tether)
    },

    update() {
        for (const tetherAPI of this.tethers) {
            tetherAPI.forceUpdate()
        }
    },
}

export interface TetherInstanceAPI {
    unsubscribe: () => void
    forceUpdate: () => void
}

/**
 * Main entry point of all tether logic. Creates tether API instance
 * and initializes the main tooltip position logic.
 */
export function createTether(tether: Tether): TetherInstanceAPI {
    function eventHandler(event: Event): void {
        // Run everything in the next frame to be able to get actual value
        // of size and element position.
        requestAnimationFrame(() => {
            const target = event.target as HTMLElement

            render(tether, target)
        })
    }

    window.addEventListener('resize', eventHandler, true)
    document.addEventListener('scroll', eventHandler, true)
    document.addEventListener('click', eventHandler, true)
    document.addEventListener('keyDown', eventHandler, true)
    document.addEventListener('input', eventHandler, true)

    // Synthetic runs without target for the initial tooltip positioning render
    requestAnimationFrame(() => render(tether, null))

    const tetherInstanceAPI: TetherInstanceAPI = {
        unsubscribe: () => {
            TetherAPI.unregisterTether(tetherInstanceAPI)
            window.removeEventListener('resize', eventHandler, true)
            document.removeEventListener('scroll', eventHandler, true)
            document.removeEventListener('click', eventHandler, true)
            document.removeEventListener('keyDown', eventHandler, true)
            document.removeEventListener('input', eventHandler, true)
        },
        forceUpdate: () => requestAnimationFrame(() => render(tether, null)),
    }

    TetherAPI.registerTether(tetherInstanceAPI)

    return tetherInstanceAPI
}
