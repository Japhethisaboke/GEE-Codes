// Define the study area
var studyArea = ee.FeatureCollection('projects/ee-japhethisaboke/assets/Final_Madagascar_Shapefile');

// Define the years of interest
var years = ee.List.sequence(2016, 2016, 1);

// Define the bands to use for classification
var bands = ['B', 'G', 'R', 'N'];

// Define the land cover classes
var CLASS_NAMES = [
    'Water', 'Trees', 'Grass', 'Flooded vegetation', 'Crops',
    'Shrub and scrub', 'Built', 'Bare', 'Snow and ice'];

// Define the color palette for the classes
var VIS_PALETTE = [
    '419BDF', '397D49', '88B053', '7A87C6',
    'E49635', 'DFC35A', 'C4281B', 'A59B8F',
    'B39FE1'];

// Define the Export_ function to export classified images
function Export_(img, region, year, tiles, studyArea) {

  tiles.map(function(tile){

    var tmpAOI = studyArea.filter(ee.Filter.eq('id', tile));

    Export.image.toDrive({
      image: img,
      description: region + '_' + tile + '_' + year,
      scale: 30,
      region: tmpAOI.geometry(),
      crs: 'EPSG:4326',
      maxPixels:  1e13,
      fileFormat: 'GeoTIFF',
      folder: 'CLASSIFIED_' + region + '_' + year,
      formatOptions: {
        cloudOptimized: true
      },
      skipEmptyTiles: true
    });
  });
}

// Loop over the years and smaller portions of the study area
years.getInfo().forEach(function(year) {
  var start_date = year + '-01-01';
  var end_date   = year + '-12-31';

  // Subset the study area into smaller portions
  var tiles = studyArea.aggregate_array('id').distinct().getInfo().slice(0, 2);

  // Loop over the smaller portions of the study area
  tiles.forEach(function(tile) {
    var tmpAOI = studyArea.filter(ee.Filter.eq('id', tile));
    var table = tmpAOI.geometry();

    // Load the image collection
    var imageCollection = ee.ImageCollection('projects/planet-nicfi/assets/basemaps/africa')
                          .filterDate(start_date, end_date)
                          .filterBounds(table)
                          .mean()
                          .select(['B', 'G', 'R', 'N'])
                          .clip(table);

    // Extract the necessary bands
    var nir = imageCollection.select('N');
    var red = imageCollection.select('R');
    var blue = imageCollection.select('B');
    var green = imageCollection.select('G');

    // Calculating the Indices 
    var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI').clip(table);
    var evi = ee.Image(2.5)
      .multiply(
        nir.subtract(red).divide(
          nir.add(ee.Image(6).multiply(red))
            .subtract(ee.Image(7.5).multiply(blue))
            .add(ee.Image(1))
        )
      )
      .rename('EVI')
      .clip(table);
    var savi = nir.subtract(red).divide(nir.add(red).add(0.5)).multiply(1.5).rename('SAVI').clip(table);
    var msavi = nir.subtract(red).multiply(2).add(1).subtract((nir.subtract(red).multiply(2).add(1).pow(2)).subtract(nir.subtract(red).multiply(8)).sqrt()).multiply(0.5).rename('MSAVI').clip(table);
    var gndvi = nir.subtract(green).divide(nir.add(green)).rename('GNDVI').clip(table);

    // Add the indices to the image collection
    var imageCollection = imageCollection.addBands([ndvi, evi, savi, msavi, gndvi]);

    // Define the training data
    var trainingData = ee.FeatureCollection('projects/ee-japhethisaboke/assets/Training_Data_Madagascar');

    // Sample the image collection
    var training = imageCollection.sampleRegions({
      collection: trainingData,
      properties: ['Class_Name'],
      scale: 30
    });

    // Train the classifier
    var classifier = ee.Classifier.randomForest(100).train({
      features: training,
      classProperty: 'Class_Name',
      inputProperties: bands
    });

    // Classify the image
    var classified = imageCollection.classify(classifier);

    // Convert the classified image to an RGB visualization
    var rgb = classified.visualize({
      palette: VIS_PALETTE,
      min: 0,
      max: 8
    });

    // Export the classified image
    Export_(rgb, 'Madagascar', year, [tile], tmpAOI);
  });
});