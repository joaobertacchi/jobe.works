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
          <path d="M132 178V230H330V278" />
          <path d="M378 178V278" />
          <path d="M590 178V240H426V278" />
          <path d="M176 430V417H330V402" />
          <path d="M572 430V368H468" />
          <path d="M362 506V402" />
        </g>

        <g className="systems-topology__primary-route">
          <path d="M394 402V432H491V552H542" pathLength="1" />
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
          transform="translate(292 278)"
        >
          <path d="m26 0 124 0 26 26v72l-26 26H26L0 98V26Z" />
          <circle cx="88" cy="62" r="52" />
          <text x="88" y="58">
            {labels.diagnosis}
          </text>
          <path d="M70 80h36" />
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
            // ports on station plates
            [132, 178],
            [378, 178],
            [590, 178],
            [176, 430],
            [572, 430],
            [362, 506],
            // ports on the diagnosis junction
            [330, 278],
            [378, 278],
            [426, 278],
            [330, 402],
            [362, 402],
            [394, 402],
            // the cross-route docks here at the junction's centerline
            [292, 340],
            [468, 340],
            // secondary-route bends
            [132, 230],
            [330, 230],
            [590, 240],
            [426, 240],
            [572, 368],
            // primary-route bends
            [394, 432],
            [491, 432],
            [491, 552],
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="6" />
          ))}
        </g>
      </svg>

      <svg
        aria-hidden="true"
        className="systems-topology systems-topology--mobile"
        viewBox="0 0 320 550"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g aria-hidden="true" className="systems-topology__secondary-routes">
          <path d="M248 62H278V276H248" />
          <path d="M72 154H48V276H72" />
          <path d="M72 434H48V328H72" />
        </g>

        <path
          className="systems-topology__mobile-route"
          d="M248 328H278V530H192"
        />

        {[
          ["01", labels.context, 24],
          ["02", labels.product, 132],
          ["06", labels.architecture, 396],
        ].map(([index, label, y]) => (
          <g
            className="systems-topology__mobile-station"
            key={String(index)}
            transform={`translate(72 ${y})`}
          >
            <path d="M0 12 12 0h152l12 12v52l-12 12H12L0 64Z" />
            <text x="16" y="28">
              {index}
            </text>
            <text className="systems-topology__node-label" x="16" y="52">
              {label}
            </text>
          </g>
        ))}

        <g
          className="systems-topology__mobile-diagnosis"
          transform="translate(72 240)"
        >
          <path d="m26 0 124 0 26 26v72l-26 26H26L0 98V26Z" />
          <circle cx="88" cy="62" r="50" />
          <text x="88" y="58">
            {labels.diagnosis}
          </text>
          <path d="M70 78h36" />
        </g>

        <g
          className="systems-topology__mobile-destination"
          transform="translate(110 482)"
        >
          <circle cx="52" cy="48" r="30" />
          {/*32,32*/}
          <circle cx="52" cy="48" r="11" />
          {/*32,32*/}
          <text x="92" y="42">
            {/*72,26*/}
            07
          </text>
          <text className="systems-topology__node-label" x="92" y="66">
            {/*72,50*/}
            {labels.production}
          </text>
        </g>

        <g aria-hidden="true" className="systems-topology__junction-dots">
          {[
            // measured route docks: entry and exit on the middle ports
            [72, 302],
            [248, 302],
            // 01 dashed connection — right lane down to the upper-right port
            [248, 62],
            [278, 62],
            [278, 276],
            [248, 276],
            // 02 dashed connection — left lane down to the upper-left port
            [72, 154],
            [48, 154],
            [48, 276],
            [72, 276],
            // 06 dashed connection — left lane up to the lower-left port
            [72, 434],
            [48, 434],
            [48, 328],
            [72, 328],
            // 07 feed — centered between the hub edge and the exit corridor
            [278, 328],
            [278, 530], //278,514
            [192, 530], //172,514
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="5" />
          ))}
        </g>
      </svg>
    </div>
  );
}
