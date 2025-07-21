// config/webContainerInstance.js
import { WebContainer } from '@webcontainer/api'; // if using StackBlitz WebContainers

let containerInstance = null;

export async function getWebContainer() {
  if (containerInstance) {
    console.log("Returning existing WebContainer instance");
    return containerInstance;
  }

  console.log("Booting new WebContainer instance");
  containerInstance = await WebContainer.boot();
  return containerInstance;
}
