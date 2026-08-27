type SystemsTopologyLabels = {
  context: string;
  product: string;
  architecture: string;
  integrations: string;
  security: string;
  observability: string;
  diagnosis: string;
  production: string;
};

type SystemsTopologyProps = {
  title: string;
  description: string;
  labels: SystemsTopologyLabels;
};

export function SystemsTopology({
  title,
  description,
  labels,
}: SystemsTopologyProps) {
  return (
    <div
      aria-label={title}
      aria-describedby="systems-topology-description"
      className="systems-topology-frame"
      role="img"
    >
      <span className="sr-only" id="systems-topology-description">
        {description}
      </span>
      <svg
        aria-hidden="true"
        className="systems-topology systems-topology--desktop"
        viewBox="0 0 760 620"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g aria-hidden="true" className="systems-topology__grid">
          <path d="M48 76H712M48 184H712M48 292H712M48 400H712M48 508H712" />
          <path d="M112 40V576M240 40V576M368 40V576M496 40V576M624 40V576" />
        </g>

        <g aria-hidden="true" className="systems-topology__secondary-routes">
          <path d="M132 132H220V208H330" />
          <path d="M270 132H402V208H476" />
          <path d="M590 132V238H520" />
          <path d="M112 462H212V396H322" />
          <path d="M638 462H548V396H452" />
          <path d="M330 208V278" />
          <path d="M476 208V278" />
          <path d="M322 350V396" />
          <path d="M452 350V396" />
        </g>

        <g className="systems-topology__primary-route">
          <path d="M70 294H180L232 342H318" pathLength="1" />
          <path d="M442 342H510L560 294H688" pathLength="1" />
          <path d="M380 404V502H650" pathLength="1" />
        </g>

        <g className="systems-topology__node" transform="translate(66 98)">
          <path d="M0 14 14 0h128l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            01
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.context}
          </text>
        </g>

        <g className="systems-topology__node" transform="translate(238 98)">
          <path d="M0 14 14 0h128l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            02
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.product}
          </text>
        </g>

        <g className="systems-topology__node" transform="translate(472 98)">
          <path d="M0 14 14 0h156l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            03
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.integrations}
          </text>
        </g>

        <g className="systems-topology__node" transform="translate(88 430)">
          <path d="M0 14 14 0h146l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            04
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.security}
          </text>
        </g>

        <g className="systems-topology__node" transform="translate(500 430)">
          <path d="M0 14 14 0h146l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            05
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.observability}
          </text>
        </g>

        <g className="systems-topology__node" transform="translate(278 506)">
          <path d="M0 14 14 0h176l14 14v52l-14 14H14L0 66Z" />
          <text x="18" y="34">
            06
          </text>
          <text className="systems-topology__node-label" x="18" y="58">
            {labels.architecture}
          </text>
        </g>

        <g
          className="systems-topology__junction"
          transform="translate(318 278)"
        >
          <path d="m22 0 80 0 22 22v80l-22 22H22L0 102V22Z" />
          <circle cx="62" cy="62" r="32" />
          <text x="62" y="58">
            {labels.diagnosis}
          </text>
          <path d="M48 76h28" />
        </g>

        <g
          className="systems-topology__destination"
          transform="translate(536 520)"
        >
          <circle cx="32" cy="32" r="26" />
          <circle cx="32" cy="32" r="10" />
          <text x="76" y="28">
            07
          </text>
          <text className="systems-topology__node-label" x="76" y="52">
            {labels.production}
          </text>
        </g>

        <g aria-hidden="true" className="systems-topology__junction-dots">
          {[
            [132, 132],
            [270, 132],
            [590, 132],
            [220, 208],
            [402, 208],
            [112, 462],
            [212, 396],
            [638, 462],
            [548, 396],
            [180, 294],
            [232, 342],
            [510, 342],
            [560, 294],
            [380, 502],
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="6" />
          ))}
        </g>
      </svg>

      <svg
        aria-hidden="true"
        className="systems-topology systems-topology--mobile"
        viewBox="0 0 320 560"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="systems-topology__mobile-route"
          d="M160 36V524"
          pathLength="1"
        />

        {[
          ["01", labels.context, 40],
          ["02", labels.product, 132],
          ["04", labels.architecture, 342],
        ].map(([index, label, y]) => (
          <g
            className="systems-topology__mobile-station"
            key={String(index)}
            transform={`translate(40 ${y})`}
          >
            <path d="M0 12 12 0h216l12 12v52l-12 12H12L0 64Z" />
            <text x="18" y="30">
              {index}
            </text>
            <text className="systems-topology__node-label" x="18" y="54">
              {label}
            </text>
            <circle cx="120" cy="76" r="5" />
          </g>
        ))}

        <g
          className="systems-topology__mobile-diagnosis"
          transform="translate(94 224)"
        >
          <path d="m18 0 96 0 18 18v96l-18 18H18L0 114V18Z" />
          <circle cx="66" cy="66" r="34" />
          <text x="66" y="62">
            {labels.diagnosis}
          </text>
          <path d="M50 80h32" />
        </g>

        <g
          className="systems-topology__mobile-destination"
          transform="translate(72 450)"
        >
          <circle cx="88" cy="42" r="30" />
          <circle cx="88" cy="42" r="11" />
          <text x="138" y="36">
            05
          </text>
          <text className="systems-topology__node-label" x="138" y="60">
            {labels.production}
          </text>
        </g>
      </svg>
    </div>
  );
}
