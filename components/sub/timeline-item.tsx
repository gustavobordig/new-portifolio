import Image from "next/image";

type TimelineRole = {
  title: string;
  period: string;
  workMode?: string;
  description: string;
};

type TimelineItemProps = {
  company: string;
  logo: string;
  location: string;
  employmentType: string;
  period: string;
  roles: readonly TimelineRole[];
};

export const TimelineItem = ({
  company,
  logo,
  location,
  employmentType,
  period,
  roles,
}: TimelineItemProps) => {
  const hasMultipleRoles = roles.length > 1;

  return (
    <article className="flex gap-4 md:gap-6 w-full">
      <div className="relative flex flex-col items-center shrink-0">
        <div className="relative z-10 h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-lg border border-[#2A0E61] bg-[#030014]">
          <Image
            src={logo}
            alt={company}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute top-14 bottom-0 w-px bg-gradient-to-b from-purple-500/60 to-cyan-500/20" />
      </div>

      <div className="flex flex-col gap-3 pb-10 min-w-0 flex-1">
        <header className="flex flex-col gap-0.5">
          {hasMultipleRoles ? (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {company}
              </h3>
              <p className="text-sm text-gray-400">
                {employmentType} · {period}
              </p>
              <p className="text-sm text-gray-500">{location}</p>
            </>
          ) : (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {roles[0].title}
              </h3>
              <p className="text-sm text-gray-300">
                {company} · {employmentType}
              </p>
              <p className="text-sm text-gray-400">{period}</p>
              <p className="text-sm text-gray-500">{location}</p>
            </>
          )}
        </header>

        {hasMultipleRoles ? (
          <ul className="flex flex-col gap-5 mt-1">
            {roles.map((role) => (
              <li key={role.title} className="relative pl-5">
                <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                <h4 className="text-base font-semibold text-white">
                  {role.title}
                </h4>
                <p className="text-sm text-gray-400">{role.period}</p>
                {role.workMode ? (
                  <p className="text-sm text-gray-500">{role.workMode}</p>
                ) : null}
                <p className="mt-1 text-sm text-gray-300 leading-relaxed">
                  {role.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed">
            {roles[0].description}
          </p>
        )}
      </div>
    </article>
  );
};
