import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState, useRef } from "react";
import useSwr from "swr";
import ReactMapGL, { Marker, FlyToInterpolator } from "react-map-gl";
import useSupercluster from "use-supercluster";
import { Oval } from 'react-loader-spinner'

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2lkamFraW5zYm9yaXNzIiwiYSI6ImNreXU1dWN4ajAzZ2Eyd3Q0OTd3OHk0OHIifQ.WfeIDuWoehxBFEk2GkTL2A";

const fetcher = (...args) => fetch(...args).then((response) => (response.json()))

export default function App() {

  const [viewport, setViewport] = useState({
    latitude: 52.092876,
    longitude: 5.104480,
    width: "90vw",
    height: "100vh",
    zoom: 12,
  });
  const mapRef = useRef();

  const url = "http://localhost:8000/api/search?city=.*"
  const { data, error } = useSwr(url, { fetcher })

  let properties = []
  if (data)
    properties = Object.values(data).slice(0, 8000)
  else
    properties = []


  const points = properties.map((prop) => ({
    type: "Feature",
    properties: { cluster: false, propId: prop.externalId },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(prop.longitude),
        parseFloat(prop.latitude),
      ],
    },
  }));

  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 },
  });


  if (!data)
    return (
      <div class="container" style={{ color: 'white' }}>
        <div class="h-100 row justify-content-center">
          <div class="col col-auto">
            <Oval
              heigth="100"
              width="100"
              color='grey'
              ariaLabel='loading'
            />
          </div>
        </div>
        <div class="row justify-content-center">
          This might take a minute...
        </div>
      </div>
    )

  return (
    <div id="mapDiv" class="d-flex justify-content-center ">
      <ReactMapGL
        {...viewport}
        maxZoom={20}
        mapboxApiAccessToken={mapboxgl.accessToken}
        onViewportChange={(newViewport) => {
          setViewport({ ...newViewport });
        }}
        ref={mapRef}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="cluster-marker"
                  style={{
                    width: `${10 + (pointCount / points.length) * 70}px`,
                    height: `${10 + (pointCount / points.length) * 70}px`,
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );

                    setViewport({
                      ...viewport,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        speed: 2,
                      }),
                      transitionDuration: "auto",
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={`crime-${cluster.properties.propId}`}
              latitude={latitude}
              longitude={longitude}
            >
              <button className="crime-marker">
                <a href={`http://localhost:3000/property/${cluster.properties.propId}`}>
                  <img src="https://icons-for-free.com/iconfiles/png/512/house-131994967908082856.png" alt="Property" />
                </a>
              </button>
            </Marker>
          );
        })}
      </ReactMapGL>
    </div>
  );
}
