let movieSearch = (function() {

  const MOV_PER_PAGE = 10;

  const $searchBox = $('.search-box');
  const $movies = $('.movies');
  const $searchBtn = $('.search-btn');
  const $numOfResultContainer = $('.num-of-result-container');
  const $numOfResult = $('.num-of-result');
  const $loader = $('<img class="loader" src="loader.svg">');

  let currPage = 0;
  let moviesLeft = 0;
  let request;

  let init = function() {
    listenForSearch();
    showMoreMovies();
  };

  let newResult = function() {
    // clear previous results
    $movies.children().remove();

    currPage = 1;
    showMovies();
  };

  // Show 1 page of movies
  let showMovies = function() {
    // Prevent executing the same ajax again
    if(request) return;

    request = $.ajax({
        url: "http://www.omdbapi.com/?",
        data: {
          s: $searchBox.val(),
          page: currPage,
          type: "movie",
        },
        dataType : "json",
        beforeSend: function() {
          $movies.append($loader);
        },
    })
      .done(function(json) {
        if(json.Response == "False") return;

        $loader.remove();

        // Show # of results
        $numOfResultContainer.show();
        $numOfResult.text(json.totalResults);


        // Show movies
        json.Search.forEach(movie => {
          showMovie(movie.imdbID);
        });

        // Update # of movies left
        if(currPage === 1) {
          moviesLeft = json.totalResults;
        }

        moviesLeft -= MOV_PER_PAGE;
        currPage++;
      })
      .always(function() {
        request = undefined;
      });
  };

  let showMovie = function(id) {
    request = $.ajax({
      url: "http://www.omdbapi.com/?",
      data: {
        i: id,
        plot: "short",
      },
      dataType: "json",
    })
      .done(function(json) {
        const $movie = $(`
          <div class="movie" id="${json.imdbID}">
            <div class="poster-container"></div>
            <div class="description">
              <h2 class="title">${json.Title} (${json.Year})</h2>
              <div class="meta">
                <p><span class="meta-title">Genre:</span> ${json.Genre}</p>
                <p><span class="meta-title">Rating:</span> ${json.imdbRating}</p>
              </div>
              <p class="plot short"><span class="meta-title">Short plot:</span> ${json.Plot}</p>
            </div>
          </div>
        `);

        if(json.Poster == "N/A") {
          $movie.find('.poster-container').addClass('default');
        } else {
          const $poster = $(`<img class="poster" src="${json.Poster}">`);
          $movie.find('.poster-container').append($poster);
        }

        $movies.append($movie);

        $movie.one('click', requestMovieDetails); // request once
        $movie.on('click', toggleMovieDetails);
      });
  };


  let listenForSearch = function() {
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

        if (totalHeight - scrollPosition === 0) {
          // when scroll to bottom of the page
          $movies.append($loader);
          showMovies();
        }
      }
    });
  };

  let requestMovieDetails = function() {
    let $movie = $(this);
    $.ajax({
      url: "http://www.omdbapi.com/?",
      data: {
        i: this.id,
        plot: "full",
      },
      dataType: "json",
    })
      .done(function(json) {
        let $meta = $(`
          <div class="extra" style="display:none">
            <p><span class="meta-title">Runtime:</span> ${json.Runtime}</p>
            <p><span class="meta-title">Director:</span> ${json.Director}</p>
            <p><span class="meta-title">Actors:</span> ${json.Actors}</p>
            <p><span class="meta-title">Language:</span> ${json.Language}</p>
            <p><span class="meta-title">Country:</span> ${json.Country}</p>
            <p><span class="meta-title">Awards:</span> ${json.Awards}</p>
          </div>
        `);
        let $fullPlot = $(`<p class="plot full" style="display:none"><span class="meta-title">Full plot:</span> ${json.Plot}</p>`);
        $movie.find('.short.plot').hide();
        $meta.appendTo($movie.find('.meta')).toggle('slow');
        $fullPlot.appendTo($movie.find('.description')).toggle('slow');

      });

  };

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
