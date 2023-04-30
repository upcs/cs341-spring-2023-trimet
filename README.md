# TriMet TroubleMakers

## Dependencies

This app uses npm. There are no dependencies through npm itself save those
default ones required to run the server and unit tests. However, there are two
important external script dependencies found in `index.html`: jQuery and
Leaflet. Leaflet is the library used for the map, with documentation found
[here](https://leafletjs.com/reference.html).

## Data

TriMet provides [data APIs](https://developer.trimet.org/ws_docs/) and [map GIS
data](https://developer.trimet.org/gis/), primarily in XML format, with some
JSON. Some APIs require an app ID that TriMet must approve; the functions in
`fetch.js` automatically take care of this. The app ID does not need protection
(indeed, it is impossible to protect it since it's placed directly in the fetch
URL), and hence is hardcoded directly in the JavaScript for simplicity.

The best way to understand TriMet's data is to download some of the data
(remembering to provide the app ID in the URL) and peruse it. Since there are
so many different pieces of data, it would be redundant and difficult to
explain them all here. However, the most critical pieces of data, namely routes
and stops, have already been fairly exhaustively used by the code, and hence
the best way to understand that is to look through the `Route` and `Stop`
classes (described below).

TriMet's data is inconsistent and has some critical oddities. In particular,
the GIS data files are rather inconsistent. For example, the MAX Shuttle has no
route lines and is missing some stops, the Aerial Tram has two stops listed
even though the data APIs have no such stops, and the Orange Night Bus has some
stops that are not connected to the route lines. Other files have
inconsistencies, such as timestamps missing for arrival times for certain
buses. In general, assume nothing about the data. Generally trust the data APIs
over the GIS data, and make sure to check whether the data attributes that
you're trying to use always exist, and if they don't, have appropriate
fallbacks.

## File descriptions

* `util.js`: Contains a few simple utility functions.
* `fetch.js`: Contains low-level fetching functions; these use promises, so
  they work well within async/await functions. However, it is almost always
  better to use the `dataManager.js` APIs when possible.
* `dataManager.js`: Contains higher-level fetching APIs; these allow fetching
  multiple files at the same time, and automatic re-fetching over an interval.
  See `stops.js` and `alerts.js` for example usage of static and interval
  fetching, respectively.
* `uiHelpers.js`: Contains useful classes for dialog boxes, message bars, and
  tab lists. Uses of these are scattered around the code.
* `map.js`: Initializes the map and contains a few map manipualation functions.
* `stops.js`: Fetches stop data and creates `Stop` objects from them.
* `routes.js`: Fetches route data and creates `Route` and associated `RouteDir`
  objects from them.
* `interaction.js`: Handles random small pieces of UI interaction that don't
  fit anywhere else.
* `table.js`: Handles all code related to the "Routes" tab--setting up buttons,
  showing routes lines, event listeners, pinning routes, etc.
* `stopsTable.js`: Handles all code related to the "Stops" tab, and is
  essentially a `table.js` for stops.
* `alerts.js`: Handles the dialog and data for service alerts.

## `Route` and `Stop` classes

The `Route` and `Stop` classes represent a single route or stop on the map as
taken from the TriMet data, along with the `RouteDir` class that represents a
single line of travel (inbound or outbound) in a route. These classes are very
important, since nearly all of the application revolves around them.

Note that the data for these classes comes from multiple files. For instance,
`Route` is made up of both the routeStops XML file and the routeCoords GIS data
file. These are fetched simulaneously using `staticFetch` from
`dataManager.js`, and then the `Route` objects are created using multiple
constructors:

1. The actual class constructor initializes the ID and nothing else.
2. `constructRouteStops()` takes the `<route>` XML node from the routeStops
   file and sets up most of the vital route information.
3. `constructMapData()` takes the `<Placemark>` node from the routeCoords file
   and creates the lines on the map. If there is no GIS data for the route,
   this constructor is never called, and only the stops for the route will be
   shown on the map without any lines.
4. `constructElems()` happens last and creates HTML elements relevant to this
   route.

Similarly, `Stop` has piecemeal constructors of similar function. Note,
however, that `<stop>` nodes are very often repeated in the routeStops file
since multiple routes pass through the same stops. However, only one `Stop`
object is ever created for each stop ID; therefore, all identical stops are
guaranteed to be shown on the map only once.

1. The actual class constructor initializes the ID and nothing else.
2. `constructRouteStops()` takes some `<stop>` XML node from the routeStops
   file with a matching ID and sets up the vital stop information and the
   marker on the map.
3. `constructMapData()` takes the `<Placemark>` node from the routeCoords file
   and colorizes the marker on the map. If there is no GIS data for the stop,
   this constructor is never called, and the marker is left at black.
4. `constructElems()` happens next and creates some of the HTML elements
   relevant to this stop.
5. `constructParentRoute()` is called multiple times, once for every `<route>`
   node that contains a `<stop>` node with this stop's ID. This is used to
   populate the `routes` array.

Descriptions of all the members of these classes:

* `Stop` fields:
    - `id`: The unique ID of this stop. This is cross-referenced by all data
      referring to this stop; for instance, current bus location data has a
      property indicating the ID of the stop the bus is heading towards.
    - `desc`: The string describing the stop.
    - `routes`: An array of `Route`s that pass through this stop, in no
      particular order.
    - `routeButtons`: An array of buttons of the same length as `routes` for
      the list of routes that pass through a stop on the Stops tab.
    - `arrivalIds`: A list of arrival IDs for buses approaching the stop; this
      is updated only when a stop is clicked in the Stops tab. This turns out
      to be slow and not very good design; it should be updated to use
      `fastFetch` instead to ensure more up-to-date information.
    - `arrivalButtons`: A list of buttons synced with `arrivalIds`.
    - `coords`: A pair of coordinates (latitude, longitude) of the stop on the
      map.
    - `selected`: True iff the stop is currently selected in the sidebar.
    - `zoomShown`: True iff the stop should be shown because the map is zoomed
      in far enough.
    - `marker`: A reference to the Leaflet marker on the map.
    - `button`: The button of this stop for use in the Stops tab.
* `Stop` methods:
    - `isShown()`: Returns true iff the stop should be shown on the map based
      on the `selected` and `zoomShown` booleans and also based on whether the
      parent route is shown.
    - `updateShown()`: Actually shows or hides the marker based on the return
      value of `isShown()`.
* `Route` fields:
    - `id`: A unique ID, just as in `Stop`.
    - `desc`: A description of the route, just as in `Stop`.
    - `routeSubType`: An enumerated value describing the type of route; see the
      `markerColors` hash table for a list of valid values.
    - `dirs`: A list containing one or two `RouteDir` objects containing the
      inbound and outbound list of stops. Some routes, like the streetcar
      loops, have only one direction.
    - `stops`: A list of all the stops found on this route in either direction.
    - `lines`: An array of arrays of coordinates. To disambiguate: a single
      polyline is an array of coordinates that the line passes through. Routes
      can be made up of multiple polylines, hence an array of polylines, or an
      array of arrays of coordinates.
    - `polylines`: An array of Leaflet polylines on the map.
    - `pinned`: True iff this route has been pinned to the map.
    - `selected`: True iff this route is currently selected in the sidebar.
    - `button`: The button of this stop for use in the Routes tab.
* `Route` methods:
    - `isShown()`: Returns true iff the route should be shown on the map based
      on the `pinned` and `selected` booleans.
    - `updateShown()` Actually shows and hides all of the polylines for this
      route and all of the constituent stop markers inside the route based on
      the return value of `isShown()`.
* `RouteDir` fields:
    * `route`: A reference to the `Route` that holds this `RouteDir` object.
    * `dir`: Either "0" or "1", describing the direction.
    * `desc`: A description of the direction, just as in `Stop`.
    * `stops`: An array of stops in this direction of the route.
    * `buttons`: A list of buttons to be shown in the sidebar when this
      particular direction of a route is selected.

For accessing the `Stop` and `Route` objects, beside the cross-reference
contained in each class, there are two primary methods:

* `stopsById`/`routesById`: Hash tables of `id: Stop` and `id: Route` mappings,
  respectively. So, if you have the ID of a stop, for instance, `stopsById[id]`
  will give you that `Stop` object.
* `stopsByOrder`/`routesByOrder`: Hash tables do not ensure proper ordering of
  the routes and stops (it sorts them by numeric ID, which is incorrect). So,
  these are arrays of `Stop` and `Route` objects in the same order as TriMet's
  data provides them.  Use these when showing entire lists of routes or stops
  rather than when trying to get individual objects.

### UI Helpers

There are well-documented UI helpers in `uiHelpers.js` that allow easy creation
of dialogs (like the About dialog), message bars (like the message that shows
up when the app is loading or when the device is not connected to the
Internet), and tabs (like the tabs that allow selecting the direction of a
route). The documentation is already thorough for them, and they are fairly
easy to use, and are hence used all throughout the code.
