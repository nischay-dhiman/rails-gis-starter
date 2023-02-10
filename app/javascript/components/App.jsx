import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoibWFya2Jlbm5ldHQiLCJhIjoiY2tyamVlcTdhMTRiYjJvbzR5eHJsdnpjbiJ9.x_spN1OL-wE2rG5I6iV-eg';

const Place = (props) => {
    return(
        <div key={props.id} >
            <p><strong>Name: </strong>{props.name}</p>
            <p><strong>Description: </strong>{props.description}</p>
            <p><strong>LonLat: </strong>{props.lonlat}</p>
            <p><strong>Rating: </strong>{props.rating}</p>
            <a href={'/places/' + props.placeid} >Show this place</a>
        </div>
    );
}


export default props => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [listPage, setlistPage] = useState(true);
    const [pdata, setPdata] = useState([]);
    const [lng, setLng] = useState(-113.4816);
    const [lat, setLat] = useState(53.5294);
    const [zoom, setZoom] = useState(9);

    const [filter, setFilter] = useState('');


    function fetchData() {
        fetch(`/places.geojson?filter=${filter}`)
            .then((response) => response.json())
            .then((placesData) => 
                {
                    console.log(placesData); 
                    setPdata(placesData);
                }
            );
    }

    // Centre the map on Edmonton on load
    useEffect(() => {
        if (map.current) return; // initialize map only once
        fetchData();
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: zoom
        });
        if(/places\/.*/.test(window.location.href)){
            setlistPage(false);
        }
    });

    // Update the coordinates and zoom on move
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    });

    useEffect(() => {
        if (!map.current?.getSource('places')) return;
        fetchData();
    }, [filter]);

    useEffect(() => {
        if (!map.current?.getSource('places')) return;
        map.current.getSource('places').setData(pdata);
    }, [pdata]);

    // Display the places GeoJSON on load
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize

        map.current.on('load', () => {
            map.current.addSource('places', {
                type: 'geojson',
                data: `/places.geojson`,
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 20
            });
            

            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'places',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        10,
                        '#f1f075',
                        75,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });


            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'places',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });
    
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'places',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 4,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });
    
            // inspect a cluster on click
            map.current.on('click', 'clusters', (e) => {
                const features = map.current.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.current.getSource('places').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;
    
                        map.current.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            });
    
            // When a click event occurs on a feature in
            // the unclustered-point layer, open a popup at
            // the location of the feature, with
            // description HTML from its properties.
            map.current.on('click', 'unclustered-point', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const { name, description, average_rating } = e.features[0].properties;
                const popupContent = `<strong>Name:</strong> <em>${name}</em><br/><strong>Description: </strong>${description}<br/><strong>Rating: </strong>${average_rating}`;
                
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(popupContent)
                    .addTo(map.current);
            });
    
            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });

            // FOR POLYGON 
            map.current.addSource('favPlaces', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [-113.53042023431169, 53.54707919418513],
                                [-113.43810140286973, 53.564635699516764],
                                [-113.47609371717311, 53.512132217895946],
                                [-113.49606085274831, 53.5172355159749],
                                [-113.49869858832798, 53.51823251608002],
                                [-113.53042023431169, 53.54707919418513]
                            ]
                        ]
                    }
                }
            });
            
            map.current.addLayer({
                'id': 'fillPlaces',
                'type': 'fill',
                'source': 'favPlaces', // reference the data source
                'layout': {},
                'paint': {
                    'fill-color': '#CBC3E3', // blue color fill
                    'fill-opacity': 0.5
                }
            });
            
            map.current.addLayer({
                'id': 'outline',
                'type': 'line',
                'source': 'favPlaces',
                'layout': {},
                'paint': {
                    'line-color': '#301934',
                    'line-width': 2
                }
            });

 
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.current.on('mouseenter', 'places-layer', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            
            // Change it back to a pointer when it leaves.
            map.current.on('mouseleave', 'places-layer', () => {
                map.current.getCanvas().style.cursor = '';
            });

        });
    });




    return (<div>

        <div >
            <h1>Statvis</h1>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            {listPage && <div >
                    <h3>Search</h3>
                    <div style={{marginBottom: "10px"}}>
                        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search by Name" />
                    </div>
                </div>
            }
            <div>
                <div>
                    <div ref={mapContainer} className="map-container" />
                </div>
                
                {listPage && <div>
                        <h3>List of Places</h3>
                        {
                            (pdata && pdata.features) && (pdata.features.map(
                                (object, i) => <Place key={i} id={i} name={object.properties.name} description={object.properties.description} lonlat={object.properties.lonlat} placeid={object.properties.id} rating={object.properties.average_rating} />)
                            )
                        }
                    </div>
                }
            </div>
        </div>        
    </div>);
}
