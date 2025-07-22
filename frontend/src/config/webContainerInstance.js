// config/webContainerInstance.js
import { WebContainer } from '@webcontainer/api'; // if using StackBlitz WebContainers

let containerInstance = null;

export async function getWebContainer() {
  if (containerInstance) {
    return containerInstance;
  }

  containerInstance = await WebContainer.boot();
  return containerInstance;
}
