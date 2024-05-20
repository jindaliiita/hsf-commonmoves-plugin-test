### Property Search Bar 

#### State Changes

Search bar contains all filters, details on what will be searched.

* Opening advanced search, or changing viewport to < 900px, synchronizes the Property attributes from the bar to the advanced filter list.

* Closing the advanced search, changing the viewport to > 900px, or applying the parameters, synchronizes the Property attributes from the advanced list, to the bar.

#### Searching

Clicking Search on bar, or Clicking 'Apply' in the advanced filter view, will either: 
  1. Change the URL to the search results page, if not there
  1. Emit the Search Event with the parameters as a payload. Search Results block handles everything else.
