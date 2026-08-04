import * as THREE from 'three';

const metal = (color = '#6c788c') => new THREE.MeshPhysicalMaterial({
  color,
  metalness: 0.85,
  roughness: 0.28,
  clearcoat: 0.3,
  envMapIntensity: 1.4
});
const polymer = (color = '#1e2734') => new THREE.MeshPhysicalMaterial({
  color,
  metalness: 0.2,
  roughness: 0.7,
  clearcoat: 0.08,
  envMapIntensity: 1
});

const makeMesh = (geometry, material, name, castShadow = true) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
};

export function createProceduralWeapon(weapon) {
  const group = new THREE.Group();
  group.name = `${weapon.id}-procedural`;

  const family = weapon.category;
  const isPistol = family === 'pistols';
  const isBullpup = ['aug', 'famas', 'p90', 'ksg'].includes(weapon.id);
  const isSniper = family === 'sniper-rifles';
  const isShotgun = family === 'shotguns';
  const isMachineGun = family === 'machine-guns';
  const baseScale = isPistol ? 0.7 : isMachineGun ? 1.25 : isSniper ? 1.15 : 1;
  const barrelLength = isPistol ? 1.2 : isShotgun ? 3.6 : isSniper ? 5.4 : isMachineGun ? 5.6 : 4.2;
  const stockLength = isBullpup ? 0.4 : isPistol ? 0.25 : 1.5;
  const handguardLength = isBullpup ? 1.6 : isPistol ? 0.5 : isMachineGun ? 2.6 : 2.1;
  const receiverLength = isPistol ? 1.5 : isBullpup ? 2.8 : 2.5;

  const receiver = makeMesh(new THREE.BoxGeometry(receiverLength, isPistol ? 0.5 : 0.7, 0.5), metal('#667085'), 'receiver');
  group.add(receiver);

  const handguard = makeMesh(new THREE.BoxGeometry(handguardLength, isPistol ? 0.22 : 0.42, 0.42), polymer(), 'handguard');
  handguard.position.x = receiverLength * 0.5 + handguardLength * 0.5 - (isBullpup ? 0.4 : 0.1);
  group.add(handguard);

  const barrel = makeMesh(new THREE.CylinderGeometry(0.07, 0.07, barrelLength, 20), metal('#7a7f87'), 'barrel');
  barrel.rotation.z = Math.PI / 2;
  barrel.position.x = receiverLength * 0.5 + handguardLength + barrelLength * 0.25 - 0.2;
  barrel.position.y = isPistol ? 0.08 : 0.02;
  group.add(barrel);

  const muzzle = makeMesh(new THREE.CylinderGeometry(0.1, 0.1, isPistol ? 0.24 : 0.46, 16), metal('#969da8'), 'muzzle');
  muzzle.rotation.z = Math.PI / 2;
  muzzle.position.x = barrel.position.x + barrelLength * 0.5;
  group.add(muzzle);

  const gasBlock = makeMesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), metal('#7b8390'), 'gas-block');
  gasBlock.position.set(barrel.position.x - barrelLength * 0.28, 0.13, 0);
  if (!isPistol) group.add(gasBlock);

  const stock = makeMesh(new THREE.BoxGeometry(stockLength, isPistol ? 0.16 : 0.5, 0.44), polymer('#232b39'), 'stock');
  stock.position.x = -receiverLength * 0.5 - stockLength * 0.5 + (isBullpup ? 0.9 : 0.08);
  stock.position.y = isPistol ? -0.06 : 0.02;
  group.add(stock);

  const grip = makeMesh(new THREE.BoxGeometry(isPistol ? 0.28 : 0.34, 0.9, 0.22), polymer('#191f2a'), 'grip');
  grip.rotation.z = isPistol ? -0.35 : -0.2;
  grip.position.set(isBullpup ? 0.5 : -0.15, -0.62, 0);
  group.add(grip);

  const trigger = makeMesh(new THREE.TorusGeometry(0.12, 0.028, 10, 18, Math.PI), metal('#c0c7d3'), 'trigger');
  trigger.rotation.z = Math.PI;
  trigger.position.set(isBullpup ? 0.3 : -0.02, -0.35, 0);
  group.add(trigger);

  const magWidth = isMachineGun ? 0.48 : isPistol ? 0.22 : 0.35;
  const magHeight = isMachineGun ? 1.35 : isPistol ? 0.65 : 1.18;
  const magazine = makeMesh(new THREE.BoxGeometry(magWidth, magHeight, 0.22), polymer('#111827'), 'magazine');
  magazine.rotation.z = isPistol ? 0.18 : 0.1;
  magazine.position.set(isPistol ? 0.12 : isBullpup ? 0.95 : 0.18, -0.88, 0);
  group.add(magazine);

  const chargingHandle = makeMesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), metal('#b0b7c1'), 'charging-handle');
  chargingHandle.position.set(-0.1, 0.22, 0.24);
  group.add(chargingHandle);

  const selector = makeMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), metal('#d7dde6'), 'safety-selector');
  selector.rotation.x = Math.PI / 2;
  selector.position.set(-0.32, -0.06, 0.27);
  group.add(selector);

  const ironSightRear = makeMesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), metal('#d0d5dd'), 'iron-sight-rear');
  ironSightRear.position.set(-0.55, 0.45, 0);
  group.add(ironSightRear);

  const ironSightFront = makeMesh(new THREE.BoxGeometry(0.14, 0.24, 0.08), metal('#d0d5dd'), 'iron-sight-front');
  ironSightFront.position.set(barrel.position.x - barrelLength * 0.18, 0.42, 0);
  group.add(ironSightFront);

  const scope = makeMesh(new THREE.CylinderGeometry(0.11, 0.11, isSniper ? 1.4 : 0.96, 20), metal('#0f172a'), 'scope');
  scope.rotation.z = Math.PI / 2;
  scope.position.set(isSniper ? 0.55 : 0.08, 0.54, 0);
  if (!isPistol) group.add(scope);

  const suppressor = makeMesh(new THREE.CylinderGeometry(0.14, 0.14, isPistol ? 0.4 : 0.9, 20), metal('#404b5a'), 'suppressor');
  suppressor.rotation.z = Math.PI / 2;
  suppressor.position.x = muzzle.position.x + (isPistol ? 0.26 : 0.7);
  suppressor.visible = ['mp5', 'mp7', 'hk416', 'm4a1', 'awm'].includes(weapon.id);
  group.add(suppressor);

  if (isShotgun || isMachineGun) {
    const pump = makeMesh(new THREE.BoxGeometry(1.1, 0.28, 0.36), polymer('#253041'), 'pump');
    pump.position.set(handguard.position.x, -0.18, 0);
    group.add(pump);
  }

  group.scale.setScalar(baseScale);
  return group;
}
