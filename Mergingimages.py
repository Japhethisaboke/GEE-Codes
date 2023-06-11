from pathlib import Path

from osgeo import gdal

import os

def mergeFunction(year, season):

    raster_name = "WeMAST_HYDROBASINS_" + year + "_" + season + ".tif"
    #raster_name = "South_Africa_NDVI_" + year + ".tif"

    folder_path = r"G:\My Drive\AI\AI_" + year + season
    #folder_path = r"D:\Drive_\South_Africa_NDVI_" + year

    output_path = r"G:\My Drive\AI\Merged"

    BASE_PATH = os.path.dirname(os.path.abspath(folder_path))

    folder = Path(folder_path)

    l = []

    for f in folder.glob('**/*.tif'):

        f_path = f.as_posix()

        l.append(f_path)
         
    no_data = float("nan")

    vrt_path = os.path.join(BASE_PATH, 'prov_vrt.vrt')
    #vrt_options = gdal.BuildVRTOptions( VRTNodata=0)

    vrt = gdal.BuildVRT(vrt_path, l)

    result = os.path.join(output_path, raster_name)
    translateoptions = gdal.TranslateOptions(gdal.ParseCommandLine("-a_nodata 0.0 -ot Float32 -of GTiff -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=6 -co BIGTIFF=YES"))

    gdal.Translate(result, vrt, options=translateoptions)

#mergeFunction("2001", "_1-4")
#mergeFunction("2000", "_1-4")
#mergeFunction("2002", "_1-4")
#mergeFunction("2003", "_1-4")
#mergeFunction("2004", "_1-4")
#mergeFunction("2005", "_1-4")
#mergeFunction("2006", "_1-4")
#mergeFunction("2007", "_1-4")
#mergeFunction("2008", "_1-4")
mergeFunction("2009", "_1-4")
mergeFunction("2010", "_1-4")
mergeFunction("2011", "_1-4")
mergeFunction("2012", "_1-4")
mergeFunction("2013", "_1-4")
mergeFunction("2014", "_1-4")
mergeFunction("2015", "_1-4")
mergeFunction("2016", "_1-4")
mergeFunction("2017", "_1-4")
mergeFunction("2018", "_1-4")
mergeFunction("2019", "_1-4")
mergeFunction("2020", "_1-4")

#mergeFunction("2000", "_5-10")
#mergeFunction("2001", "_5-10")
#mergeFunction("2002", "_5-10")
#mergeFunction("2003", "_5-10")
#mergeFunction("2004", "_5-10")
#mergeFunction("2005", "_5-10")
#mergeFunction("2006", "_5-10")
#mergeFunction("2007", "_5-10")
#mergeFunction("2008", "_5-10")
mergeFunction("2009", "_5-10")
mergeFunction("2010", "_5-10")
mergeFunction("2011", "_5-10")
mergeFunction("2012", "_5-10")
mergeFunction("2013", "_5-10")
mergeFunction("2014", "_5-10")
mergeFunction("2015", "_5-10")
mergeFunction("2016", "_5-10")
mergeFunction("2017", "_5-10")
mergeFunction("2018", "_5-10")
mergeFunction("2019", "_5-10")
mergeFunction("2020", "_5-10")


