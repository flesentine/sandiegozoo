import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
  assertInteriorTreetopsV7GeometryAuthorityIntegrity,
  type InteriorTreetopsV7GeometryAuthority,
} from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";

function mutableClone(): InteriorTreetopsV7GeometryAuthority {
  const source = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  return {
    ...source,
    orderedNodeIds: [...source.orderedNodeIds],
    nodes: source.nodes.map((node) => ({ ...node })),
  };
}

test("Planner 43 rejects Proxy-backed arrays without invoking get traps", () => {
  const collectionAuthority = mutableClone();
  let collectionReads = 0;
  const collectionProxy = new Proxy([collectionAuthority], {
    get(target, property, receiver) {
      collectionReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity(collectionProxy as unknown as readonly InteriorTreetopsV7GeometryAuthority[]),
    /Proxy-backed/,
  );
  assert.equal(collectionReads, 0);

  const orderedAuthority = mutableClone();
  let orderedReads = 0;
  orderedAuthority.orderedNodeIds = new Proxy([...orderedAuthority.orderedNodeIds], {
    get(target, property, receiver) {
      orderedReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([orderedAuthority]),
    /Proxy-backed/,
  );
  assert.equal(orderedReads, 0);

  const nodesAuthority = mutableClone();
  let nodeCollectionReads = 0;
  nodesAuthority.nodes = new Proxy(nodesAuthority.nodes.map((node) => ({ ...node })), {
    get(target, property, receiver) {
      nodeCollectionReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([nodesAuthority]),
    /Proxy-backed/,
  );
  assert.equal(nodeCollectionReads, 0);
});

test("Planner 43 screens captured fields on branded exotic authority records", () => {
  const source = mutableClone();
  let orderedReads = 0;
  let nodeCollectionReads = 0;
  const orderedNodeIds = new Proxy([...source.orderedNodeIds], {
    get(target, property, receiver) {
      orderedReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  const nodes = new Proxy(source.nodes.map((node) => ({ ...node })), {
    get(target, property, receiver) {
      nodeCollectionReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });

  const branded = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(branded, Object.prototype);
  const capturedFields = { ...source, orderedNodeIds, nodes };
  for (const [field, value] of Object.entries(capturedFields)) {
    Object.defineProperty(branded, field, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }

  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([branded as unknown as InteriorTreetopsV7GeometryAuthority]),
    /Proxy-backed/,
  );
  assert.equal(orderedReads, 0);
  assert.equal(nodeCollectionReads, 0);
});
