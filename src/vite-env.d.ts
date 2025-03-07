/// <reference types="vite/client" />
/// <reference types="@types/leaflet" />
/// <reference types="@types/leaflet-draw" />

declare global {
  namespace L {
    namespace Draw {
      const Event: {
        CREATED: string;
        EDITED: string;
        DELETED: string;
        DRAWSTART: string;
        DRAWSTOP: string;
        DRAWVERTEX: string;
        EDITSTART: string;
        EDITMOVE: string;
        EDITRESIZE: string;
        EDITVERTEX: string;
        EDITSTOP: string;
        DELETESTART: string;
        DELETESTOP: string;
      };
    }

    interface DrawEvents {
      Created: {
        layer: L.Layer;
        layerType: string;
      }
    }

    namespace GeometryUtil {
      function geodesicArea(latLngs: L.LatLng[]): number;
      function readableArea(area: number, isMetric?: boolean): string;
    }
  }
}