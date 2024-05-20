### Property Search Results

This block renders the map and list of properties returned from a search.

#### Default Search

If no parameters were used (i.e. someone typed in the URL of the page), a default Search parameter set is used.

#### Keeping in Sync

This and the Property Search Bar block have shared parameters. When this block is used to set parameters, the search is performed immediately and the Search Bar state is updated (see `updateForm` in the Property Search Bar `delayed.js`)

If the Property Search Bar is updated and a search submitted or applied, it emits an event, which is processed by this block. The `updateFilters` block will keep the few items in sync when the new search is executed.

#### Results, Map and Browser History

This page rendering these results should not refresh each time a new search is performed. So we're using `pushState` and `popstate` history manipulation.

When new search parameters are provided, push that state to the history, then perform the search (via `doSearch`);

The trick here is making sure that cyclic searching doesn't occur.

When the page is first rendered:
  1. Generate and center the map
  1. Perform the search.
  1. Render results
  1. Decorate the map.

Any time a Search Event occurs:
  1. Perform the search.
  1. Render results
  1. Decorate the map.

If the Map bounds change:
  1. Create a new Search object with the bounds
  1. Emit the Search Event with the payload

If the Search Filters change:
  1. Create a new Search object with the bounds
  1. Emit the Search Event with the payload

If a history pop-state occurs:
  1. Sync the Filters to the history state
  1. Tell Search Bar to sync its state.
  1. Create search from history URL, then perform the search.
  1. Render results
  1. Decorate the map.


Anytime the Map is decorating, which causes the bounds to change, flag that it's rendering. This prevents a render event from causing a second, new search.
