let movieSearch = (function() {

  const MOV_PER_PAGE = 10;

  const $searchBox = $('.search-box');
  const $movies = $('.movies');
  const $searchBtn = $('.search-btn');
  const $numOfResultContainer = $('.num-of-result-container');
  const $numOfResult = $('.num-of-result');
  const $loader = $('<img class="loader" src="loader.svg">');

  let currPage, moviesLeft, loading;


  let init = function() {
    moviesLeft = 0
    loading = false;

    onSearch();
    showMoreMovies();
    updateAjaxLoadingStatus();
  };

  let newResult = function() {
    // clear previous results
    $movies.children().remove();

    currPage = 1;

    requestMovies();
  };


  let updateAjaxLoadingStatus = function() {
    $(document).ajaxStart(function() {
                loading = true;
               })
               .ajaxStop(function() {
                 loading = false;
               });
  };


  let showLoader = function($loaderContainer) {
    $loaderContainer.append($loader);
  };


  let requestMovies = function() {
    // Data for requesting movies of the current page
    let requestData = {
      s: $searchBox.val(),
      page: currPage,
      type: "movie",
    };

    // ajaxMovieRequest(requestData, $movies, showMovies);
    $.ajax({
        url: "http://www.omdbapi.com/?",
        data: requestData,
        dataType : "json",
        beforeSend: function() {
          showLoader($movies);
        },
    })
      .done(showMovies);
  };


  // Show 1 page of movies
  let showMovies = function(moviesJson) {
    if(moviesJson.Response == "False") return;

    $loader.remove();

    // Show # of results
    $numOfResultContainer.show();
    $numOfResult.text(moviesJson.totalResults);

    // Show movies
    moviesJson.Search.forEach(movie => {
      requestMovie(movie.imdbID);
    });

    // Update # of movies left and current page number
    if(currPage === 1) {
      moviesLeft = moviesJson.totalResults;
    }
    moviesLeft -= MOV_PER_PAGE;
    currPage++;
  };


  let requestMovie = function(id) {
    // Data for searching a specific movie with short plot
    let requestData = {
      i: id,
      plot: "short",
    };

    $.ajax({
      url: "http://www.omdbapi.com/?",
      data: requestData,
      dataType: "json",
    })
      .done(showMovie);
  };


  // Show one movie
  let showMovie = function(movieJson) {
    let $movie = $(`
      <div class="movie" id="${movieJson.imdbID}">
        <div class="poster-container"></div>
        <div class="description">
          <span class="title">${movieJson.Title} </span><span class="year"> (${movieJson.Year})</span>
          <div class="meta">
            <p><span class="meta-title">Genre:</span> ${movieJson.Genre}</p>
            <p><span class="meta-title">Rating:</span> ${movieJson.imdbRating}</p>
          </div>
          <p class="plot short"><span class="meta-title">Plot:</span> ${movieJson.Plot}</p>
        </div>
      </div>
    `);

    if(movieJson.Poster == "N/A") {
      $movie.find('.poster-container').addClass('default');
    } else {
      const $poster = $(`<img class="poster" src="${movieJson.Poster}">`);
      $movie.find('.poster-container').append($poster);
    }

    $movies.append($movie);

    // Show movie details on click
    $movie.one('click', requestMovieDetails); // request data once
    $movie.on('click', toggleMovieDetails);
  };


  let onSearch = function() {
    $searchBtn.on('click', function(e) {
      e.preventDefault();
      newResult();
    });
  };


  let showMoreMovies = function() {
    $(window).on("scroll", function() {
      if(moviesLeft > 0) {
        let totalHeight = $(document).height();
        let scrollPosition = $(window).height() + $(window).scrollTop();

        if (totalHeight - scrollPosition === 0 && !loading) {
          // when scroll to bottom of the page
          $movies.append($loader);
          requestMovies();
        }
      }
    });
  };


  // Called to request details when clicking on a movie for the 1st time.
  let requestMovieDetails = function() {
    const $movie = $(this);

    // Data for searching a movie with full plot
    let requestData = {
      i: this.id,
      plot: "full",
    };

    $.ajax({
      url: "http://www.omdbapi.com/?",
      data: requestData,
      dataType: "json",
    })
      .done(function(movieJson) {
        showMovieDetails(movieJson, $movie);
      });
  };

  // Show more detailed info of a movie
  let showMovieDetails = function(movieJson, $movie) {
    let $meta = $(`
      <div class="extra" style="display:none">
        <p><span class="meta-title">Runtime:</span> ${movieJson.Runtime}</p>
        <p><span class="meta-title">Director:</span> ${movieJson.Director}</p>
        <p><span class="meta-title">Actors:</span> ${movieJson.Actors}</p>
        <p><span class="meta-title">Language:</span> ${movieJson.Language}</p>
        <p><span class="meta-title">Country:</span> ${movieJson.Country}</p>
        <p><span class="meta-title">Awards:</span> ${movieJson.Awards}</p>
      </div>
    `);
    let $fullPlot = $(`<p class="plot full" style="display:none"><span class="meta-title">Plot:</span> ${movieJson.Plot}</p>`);

    $movie.find('.short.plot').hide();
    $meta.appendTo($movie.find('.meta')).toggle('slow');
    $fullPlot.appendTo($movie.find('.description')).toggle('slow');
  };


  // Called to toggle details when clicking on a movie.
  let toggleMovieDetails = function() {
    let $movie = $(this);

    $movie.find('.full.plot').toggle('slow');
    $movie.find('.short.plot').toggle('slow');
    $movie.find('.meta .extra').toggle('slow');
  };

  return {
    init: init,
  }

})();

movieSearch.init();
