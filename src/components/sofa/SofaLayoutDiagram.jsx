import { num } from '../../utils/formatters';

export default function SofaLayoutDiagram({
  mode,
  shape,
  sections,
  handleCount,
}) {
  // Determine whether to render preset shape diagram (Straight / L / C) or manual block list
  const isPresetStraight =
    mode === 'total' && shape === 'straight' && sections.length === 2;
  const isPresetL =
    mode === 'total' && shape === 'l_shape' && sections.length === 2;
  const isPresetC =
    mode === 'total' && shape === 'c_shape' && sections.length === 3;

  return (
    <div className="form-card diagram-card">
      <div className="form-section-title">
        સોફાની ગોઠવણીનો નકશો (Layout Diagram)
      </div>

      {isPresetStraight && (
        <div className="diagram-wrap">
          <svg
            viewBox="0 0 560 130"
            className="sofa-svg"
            aria-label="Straight Sofa Layout"
          >
            {/* Sofa 1 */}
            <g transform="translate(20, 30)">
              {/* Left Handle */}
              <rect x="0" y="10" width="24" height="50" rx="5" className="svg-handle" />
              <text x="12" y="80" className="svg-sub">1'</text>

              {/* Seat 1 */}
              <rect x="28" y="10" width="160" height="50" rx="6" className="svg-seat" />
              <rect x="28" y="2" width="160" height="10" rx="4" className="svg-teko" />
              <text x="108" y="40" className="svg-label">
                {num(sections[0].seatFt)} ફૂટ
              </text>

              {/* Right Handle */}
              <rect x="192" y="10" width="24" height="50" rx="5" className="svg-handle" />
              <text x="204" y="80" className="svg-sub">1'</text>
            </g>

            {/* Sofa 2 */}
            <g transform="translate(300, 30)">
              <rect x="0" y="10" width="24" height="50" rx="5" className="svg-handle" />
              <text x="12" y="80" className="svg-sub">1'</text>

              <rect x="28" y="10" width="160" height="50" rx="6" className="svg-seat" />
              <rect x="28" y="2" width="160" height="10" rx="4" className="svg-teko" />
              <text x="108" y="40" className="svg-label">
                {num(sections[1].seatFt)} ફૂટ
              </text>

              <rect x="192" y="10" width="24" height="50" rx="5" className="svg-handle" />
              <text x="204" y="80" className="svg-sub">1'</text>
            </g>

            <text x="280" y="122" className="svg-caption">
              કુલ હેન્ડલ: {handleCount} નંગ (1 ફૂટ/નંગ)
            </text>
          </svg>
        </div>
      )}

      {isPresetL && (
        <div className="diagram-wrap">
          <svg
            viewBox="0 0 440 220"
            className="sofa-svg"
            aria-label="L-Shape Sofa Layout"
          >
            {/* L-Section (Vertical on Left) */}
            <rect x="80" y="30" width="70" height="130" rx="6" className="svg-seat" />
            {/* Teko Moto Bhag (Left outer edge) */}
            <rect x="70" y="30" width="10" height="130" rx="4" className="svg-teko" />
            {/* Teko Khuniyo (Top edge) */}
            <rect x="80" y="20" width="70" height="10" rx="4" className="svg-teko" />

            <text x="115" y="14" className="svg-sub">
              ખૂણિયો: {num(sections[0].cornerFt)}'
            </text>
            <text x="42" y="100" className="svg-label">
              {num(sections[0].mainFt)}'
            </text>
            <text x="115" y="100" className="svg-label">
              L-સોફો
            </text>

            {/* Bottom Handle */}
            <rect x="80" y="166" width="70" height="22" rx="5" className="svg-handle" />
            <text x="115" y="204" className="svg-sub">હેન્ડલ (1')</text>

            {/* Straight Section (Top Right) */}
            <rect x="158" y="30" width="160" height="58" rx="6" className="svg-seat" />
            <rect x="158" y="20" width="160" height="10" rx="4" className="svg-teko" />
            <text x="238" y="64" className="svg-label">
              {num(sections[1].seatFt)} ફૂટ (સીધો)
            </text>

            {/* Right Handle */}
            <rect x="324" y="30" width="24" height="58" rx="5" className="svg-handle" />
            <text x="336" y="106" className="svg-sub">હેન્ડલ (1')</text>
          </svg>
        </div>
      )}

      {isPresetC && (
        <div className="diagram-wrap">
          <svg
            viewBox="0 0 500 230"
            className="sofa-svg"
            aria-label="C-Shape Sofa Layout"
          >
            {/* Left L-Section */}
            <rect x="75" y="32" width="70" height="130" rx="6" className="svg-seat" />
            <rect x="65" y="32" width="10" height="130" rx="4" className="svg-teko" />
            <rect x="75" y="22" width="70" height="10" rx="4" className="svg-teko" />
            <text x="110" y="16" className="svg-sub">
              {num(sections[0].cornerFt)}'
            </text>
            <text x="40" y="100" className="svg-label">
              {num(sections[0].mainFt)}'
            </text>
            <text x="110" y="100" className="svg-sub">ડાબી L</text>
            {/* Left Bottom Handle */}
            <rect x="75" y="168" width="70" height="22" rx="5" className="svg-handle" />
            <text x="110" y="206" className="svg-sub">હેન્ડલ (1')</text>

            {/* Middle Straight Section */}
            <rect x="152" y="32" width="196" height="56" rx="6" className="svg-seat" />
            <rect x="152" y="22" width="196" height="10" rx="4" className="svg-teko" />
            <text x="250" y="65" className="svg-label">
              {num(sections[1].seatFt)} ફૂટ (વચ્ચે)
            </text>

            {/* Right L-Section */}
            <rect x="355" y="32" width="70" height="130" rx="6" className="svg-seat" />
            <rect x="425" y="32" width="10" height="130" rx="4" className="svg-teko" />
            <rect x="355" y="22" width="70" height="10" rx="4" className="svg-teko" />
            <text x="390" y="16" className="svg-sub">
              {num(sections[2].cornerFt)}'
            </text>
            <text x="458" y="100" className="svg-label">
              {num(sections[2].mainFt)}'
            </text>
            <text x="390" y="100" className="svg-sub">જમણી L</text>
            {/* Right Bottom Handle */}
            <rect x="355" y="168" width="70" height="22" rx="5" className="svg-handle" />
            <text x="390" y="206" className="svg-sub">હેન્ડલ (1')</text>
          </svg>
        </div>
      )}

      {!isPresetStraight && !isPresetL && !isPresetC && (
        <div className="manual-diagram-flex">
          {sections.map((sec, idx) => (
            <div key={sec.id || idx} className="manual-diagram-block">
              <div className="mdb-teko">
                ટેકો:{' '}
                {sec.type === 'l_corner'
                  ? `${num(sec.mainFt)}' + ${num(sec.cornerFt)}'`
                  : `${num(sec.seatFt)}'`}
              </div>
              <div className="mdb-seat">
                {sec.type === 'l_corner' ? 'L-આકાર' : 'સીધો'}
                <br />
                <strong>
                  {sec.type === 'l_corner'
                    ? `${num(sec.mainFt)} + ${num(sec.cornerFt)} ફૂટ`
                    : `${num(sec.seatFt)} ફૂટ`}
                </strong>
              </div>
            </div>
          ))}
          <div className="manual-diagram-handles">
            હેન્ડલ: <strong>{handleCount} નંગ</strong>
          </div>
        </div>
      )}
    </div>
  );
}
