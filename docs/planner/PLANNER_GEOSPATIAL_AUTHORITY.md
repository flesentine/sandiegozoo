# Planner 11 — Independent Geospatial Authority

**Status:** feature-location evidence only; guest routing still blocked

Planner 11 adds the first independently sourced latitude/longitude observations without turning them into production navigation points.

## The distinction

A mapped feature coordinate can answer:

**“Where is this mapped feature approximately located?”**

It does not necessarily answer:

**“Which exact gate/door/path node should a Zoo guest route to?”**

Planner 11 therefore introduces:

`plannerMaterialization: "feature-geometry-only"`

and keeps Planner 1 `NavigationPoint` / `RouteNode` materialization blocked.

## First target: Wegeforth Bowl

Planner 9 establishes Wildlife Wonders' current venue as Wegeforth Bowl.

Planner 10 establishes an official map anchor for Wegeforth Bowl.

Planner 11 adds two independent geospatial observations of the venue feature:

### OpenStreetMap feature geometry

- OSM way: **79135720**
- feature class: theatre building
- observed representative point: **32.73367, -117.14972**

The retrieval surface identifies the source feature as:

`amenity=theatre`

### GeoNames feature point

- GeoNames ID: **5407722**
- observed point: **32.73366, -117.14976**

The two published points are only a few meters apart.

Planner 11 therefore reports Wegeforth Bowl as:

`corroborated-feature-location`

This corroborates the venue's feature location.

It still does not establish which entrance to Wegeforth Bowl is the correct guest routing target.

## Second target: San Diego Zoo Main Entrance

The City of San Diego currently tells rideshare visitors to use the main Zoo Entrance and states that the Zoo Entrance is on Zoo Drive.

Independent OpenStreetMap feature geometry identifies:

- OSM way: **79293454**
- feature: San Diego Zoo Main Entrance building
- observed representative point: **32.73513, -117.14930**

This is currently a **single-source feature location**.

It is not promoted into an entrance-node coordinate because the OSM way location is building/feature geometry rather than an explicit `entrance=*` or `routing:entrance=*` node.

## Why the guest navigation point remains blocked

OpenStreetMap's entrance model distinguishes a mapped building/area from an explicit entrance node.

Planner 11 requires actual entrance-point evidence before creating the guest-facing point required by Planner 1.

For both first-slice targets:

`assessGuestNavigationPointAuthority(...)`

returns:

`GUEST_ENTRANCE_POINT_NOT_SOURCED`

Even Wegeforth Bowl's multi-source feature-location agreement does not bypass that rule.

## Corroboration policy

Multiple independent feature observations are called corroborated only when every pair is within:

**25 meters**

This threshold is used only to classify agreement about a mapped feature location.

It is not a routing tolerance and is not used to manufacture an averaged planner point.

Planner 11 deliberately does **not** average coordinates.

Every source observation remains independently preserved.

## No routing materialization

The geospatial catalog contains no:

- `routeNodeId`
- `NavigationPoint`
- `RouteNode`
- `RouteEdge`
- `distanceMeters`
- `durationMinutes`

Coordinates remain evidence observations, not planner graph authority.

## Source notes

The current source surfaces used in this first slice are external/open geodata views:

- OpenStreetMap-derived feature pages exposed through Mapcarta
- GeoNames-derived Wegeforth Bowl feature point exposed through Mapcarta

Planner 11 records the underlying provider/object IDs as well as the retrieval URL.

The City of San Diego page is used only as official semantic context that the Zoo's main entrance is on Zoo Drive; it does not supply the coordinate.

## Scope boundary

Planner 11 does not yet:

- create a production guest-facing entrance coordinate
- create RouteNodes
- create route edges
- average independent feature coordinates
- infer a door from building geometry
- treat a building centroid/representative point as a pedestrian entrance
- map Panda Ridge geometry where no sufficiently clear independent feature source has been established

The next clean step is to find an explicit pedestrian entrance/routing node for one target, or keep that target blocked if the evidence does not exist.
