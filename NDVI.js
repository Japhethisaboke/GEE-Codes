// Define the area of interest (AOI)
var aoi = ee.FeatureCollection('projects/ee-isabokedata/assets/WeMAST_HYDROBASINS');

// Define the start and end years
var startYear = 2000;
var endYear = 2020;

// Loop through the years and download the NDVI images
for (var year = startYear; year <= endYear; year++) {
  // Define the start and end dates for the year
  var startDate = ee.Date.fromYMD(year, 01, 1);
  var endDate = ee.Date.fromYMD(year, 04, 30);

  // Filter the Landsat collection for the year and AOI
  var collection;
  if (year <= 2012) {
    collection = ee.ImageCollection('LANDSAT/LT05/C02/T2_L2')
      .filterDate(startDate, endDate)
      .filterBounds(aoi)
      .select(['SR_B5', 'SR_B4'],['B5','B4']);
  } else {
    collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
      .filterDate(startDate, endDate)
      .filterBounds(aoi)
      .select(['B5','B4'])
  }

  // // Cloud masking
  // // var maskedCollection = collection.map(function(image) {
  // //   var cloudMask = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  // //   var maskedImage = image.updateMask(cloudMask.lt(50));
  // //   return maskedImage;
  // });

  // Compute the NDVI for the year
  var ndvi = collection.map(function(image) {
    var nir = image.select('B5');
    var red = image.select('B4');
    // var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
    var ndvi = image.normalizedDifference(["B5","B4"]).rename('NDVI');
    return ndvi.toFloat().copyProperties(image, ['system:time_start']);
  });

  // Get the median NDVI image for the year
  var median = ndvi.mean();

  // Download the image to Google Drive
  var image = median.clip(aoi);
  Export.image.toDrive({
    image: image,
    description: 'NDVI_' + year,
    folder: 'NDVI_DRY1000',
    scale: 250,
    region: aoi.geometry().bounds(),
    maxPixels: 1e13
  });
}
