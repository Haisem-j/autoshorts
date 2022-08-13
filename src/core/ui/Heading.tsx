type HeadingType = 1 | 2 | 3 | 4 | 5 | 6;

const Heading: React.FCC<{ type?: HeadingType }> = ({ type, children }) => {
  switch (type) {
    case 1:
      return <h1 className={'text-4xl font-extrabold'}>{children}</h1>;
    case 2:
      return <h2 className={'text-2xl font-bold'}>{children}</h2>;
    case 3:
      return <h3 className={'text-xl font-bold'}>{children}</h3>;
    case 4:
      return <h4 className={'text-lg font-semibold'}>{children}</h4>;
    case 5:
      return <h5 className={'text-base font-semibold'}>{children}</h5>;
    case 6:
      return <h6 className={'text-sm font-medium'}>{children}</h6>;

    default:
      return <Heading type={1}>{children}</Heading>;
  }
};

export default Heading;
